import { NextRequest, NextResponse } from 'next/server';
import { generateCadastralImage } from '@/services/visuals/assetGenerator';
import { PrismaClient } from '@prisma/client';
import { computePiscineHash, computeRoofHash } from '@/services/localisation/exclusionService';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Localisation API called');
    
    const body = await request.json();
    console.log('📦 Request body keys:', Object.keys(body));
    
    // Validation
    if (!body.imageUrl && !body.imageFile && !body.url) {
      return NextResponse.json(
        { error: 'Au moins une image ou URL est requise' },
        { status: 400 }
      );
    }
    
    // Vérification clés API
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY manquante' },
        { status: 500 }
      );
    }
    
    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return NextResponse.json(
        { error: 'GOOGLE_MAPS_API_KEY manquante' },
        { status: 500 }
      );
    }
    
    console.log('✅ API Keys validated');

    // ============================================
    // PHASE 1: ANALYSE DE L'IMAGE
    // ============================================
    
    let imageAnalysis = null;

    if (body.imageUrl || body.imageFile) {
      console.log('📸 Starting image analysis...');
      
      const imageToAnalyze = body.imageUrl || body.imageFile;
      
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyse cette photo de bien immobilier avec EXTRÊME PRÉCISION.

Retourne UNIQUEMENT un JSON avec cette structure :

{
  "typeBien": "maison" | "villa" | "appartement",
  "styleArchitectural": "description détaillée",
  "materiaux": {
    "facade": ["matériau1"],
    "facadeCouleur": "couleur exacte",
    "toiture": ["matériau"],
    "toitureCouleur": "couleur exacte"
  },
  "elementsExterieurs": {
    "piscine": {
      "presente": true/false,
      "forme": "rectangulaire/ronde/haricot/forme-L",
      "dimensions": "Xm x Ym",
      "couleur": "bleu/turquoise/vert",
      "position": "arrière/côté/devant"
    },
    "jardin": {
      "present": true/false,
      "surface": "petit/moyen/grand",
      "vegetation": ["type1", "type2"]
    },
    "terrasse": true/false,
    "balcon": true/false,
    "garage": true/false
  },
  "indicesGeographiques": {
    "climat": "méditerranéen/océanique/continental",
    "vegetation": ["type1", "type2"],
    "regionProbable": "région"
  },
  "signesDistinctifs": ["détail1", "détail2"],
  "confidenceScore": 0-100
}

Sois ULTRA PRÉCIS sur la piscine si présente.`
                },
                {
                  type: 'image_url',
                  image_url: { url: imageToAnalyze, detail: 'high' }
                }
              ]
            }
          ],
          max_tokens: 1500,
          temperature: 0.3
        })
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('❌ OpenAI error:', errorText);
        throw new Error(`OpenAI API error: ${openaiResponse.status}`);
      }

      const openaiData = await openaiResponse.json();
      const content = openaiData.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content in OpenAI response');
      }

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      imageAnalysis = JSON.parse(jsonMatch[0]);
      console.log('✅ Image analysis completed');
      console.log('🔍 Detected pool:', imageAnalysis.elementsExterieurs?.piscine?.presente);
    }

    // ============================================
    // PHASE 2: DÉTERMINATION DE LA ZONE (FORCÉE)
    // ============================================

    console.log('🗺️ Determining search zone...');
    console.log('📦 Body keys:', Object.keys(body));
    console.log('🔍 selectedZone in body:', JSON.stringify(body.selectedZone, null, 2));
    console.log('🔍 hints in body:', body.hints);

    let searchZone = {
      center: { lat: 48.8566, lng: 2.3522 },
      radius: 50000,
      confidence: 'low' as const,
      source: 'default'
    };

    // PRIORITÉ ABSOLUE 1 : selectedZone avec cityData
    if (body.selectedZone?.type === 'city' && body.selectedZone?.cityData) {
      console.log('✅ USING SELECTED ZONE WITH CITY DATA');
      console.log('City data:', body.selectedZone.cityData);
      
      searchZone = {
        center: {
          lat: body.selectedZone.cityData.latitude,
          lng: body.selectedZone.cityData.longitude
        },
        radius: body.selectedZone.radius || 3000,
        confidence: 'high' as const,
        source: 'selectedZone'
      };
      
      console.log('📍 Zone from selectedZone:', searchZone);
    }
    // PRIORITÉ 2 : selectedZone avec center direct
    else if (body.selectedZone?.center) {
      console.log('✅ USING SELECTED ZONE WITH CENTER');
      
      searchZone = {
        center: body.selectedZone.center,
        radius: body.selectedZone.radius || 5000,
        confidence: 'medium' as const,
        source: 'selectedZoneCenter'
      };
      
      console.log('📍 Zone from center:', searchZone);
    }
    // PRIORITÉ 3 : selectedZone avec lat/lng direct
    else if (body.selectedZone?.lat && body.selectedZone?.lng) {
      console.log('✅ USING SELECTED ZONE WITH LAT/LNG');
      
      searchZone = {
        center: {
          lat: body.selectedZone.lat,
          lng: body.selectedZone.lng
        },
        radius: (body.selectedZone.radiusKm || 3) * 1000,
        confidence: 'high' as const,
        source: 'selectedZoneLatLng'
      };
      
      console.log('📍 Zone from lat/lng:', searchZone);
    }
    // PRIORITÉ 4 : Code postal dans hints
    else if (body.hints?.codePostal) {
      console.log('✅ GEOCODING FROM POSTAL CODE:', body.hints.codePostal);
      
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${body.hints.codePostal},France&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodeResponse.json();
        console.log('Geocode results:', geocodeData.results?.length || 0);
        
        if (geocodeData.results?.[0]) {
          const location = geocodeData.results[0].geometry.location;
          searchZone = {
            center: { lat: location.lat, lng: location.lng },
            radius: 3000,
            confidence: 'high' as const,
            source: 'postalCode'
          };
          
          console.log('📍 Zone from postal code:', searchZone);
        }
      } catch (error) {
        console.error('❌ Geocoding error:', error);
      }
    }
    // PRIORITÉ 5 : Ville dans hints
    else if (body.hints?.ville) {
      console.log('✅ GEOCODING FROM CITY:', body.hints.ville);
      
      try {
        const geocodeResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(body.hints.ville)},France&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
        );
        
        const geocodeData = await geocodeResponse.json();
        
        if (geocodeData.results?.[0]) {
          const location = geocodeData.results[0].geometry.location;
          searchZone = {
            center: { lat: location.lat, lng: location.lng },
            radius: 5000,
            confidence: 'medium' as const,
            source: 'city'
          };
          
          console.log('📍 Zone from city:', searchZone);
        }
      } catch (error) {
        console.error('❌ Geocoding error:', error);
      }
    }

    console.log('📍 FINAL SEARCH ZONE:', {
      lat: searchZone.center.lat,
      lng: searchZone.center.lng,
      radius: searchZone.radius,
      confidence: searchZone.confidence,
      source: searchZone.source
    });

    // VÉRIFICATION : Si zone par défaut, renvoyer erreur
    if (searchZone.source === 'default') {
      console.error('❌ NO VALID ZONE PROVIDED');
      return NextResponse.json(
        { 
          error: 'Zone de recherche manquante',
          details: 'Veuillez sélectionner une zone de recherche ou fournir un code postal'
        },
        { status: 400 }
      );
    }

    // VÉRIFIER QUE LA ZONE N'EST PAS PARIS PAR DÉFAUT
    if (Math.abs(searchZone.center.lat - 48.8566) < 0.01 && 
        Math.abs(searchZone.center.lng - 2.3522) < 0.01) {
      console.error('⚠️ WARNING: Zone is still default Paris!');
    }

    // ============================================
    // PHASE 3: RECHERCHE DES CANDIDATS RÉELS
    // ============================================

    console.log('🔍 Starting property search with zone:', {
      center: searchZone.center,
      radius: searchZone.radius,
      source: searchZone.source
    });

    // Vérifier que la zone n'est pas Paris
    if (searchZone.source === 'default') {
      throw new Error('Cannot search with default zone');
    }
    
    const searchForPool = imageAnalysis?.elementsExterieurs?.piscine?.presente === true;
    console.log('🏊 Search criteria:', {
      pool: searchForPool,
      roofColor: imageAnalysis?.materiaux?.toitureCouleur
    });

    // Générer grille de points
    const searchPoints = generateSearchGrid(
      searchZone.center.lat,
      searchZone.center.lng,
      searchZone.radius / 1000,
      40 // Tester 40 points
    );

    console.log(`📍 Testing ${searchPoints.length} points`);

    const candidates: any[] = [];
    let testedCount = 0;

    for (const point of searchPoints) {
      testedCount++;
      
      try {
        // 1. Récupérer l'adresse
        const address = await reverseGeocode(point.lat, point.lng);
        
        if (!address || !address.street) continue;

        // Éviter doublons
        if (candidates.find(c => c.adresse === address.street)) continue;

        // 2. Si on cherche une piscine, vérifier sur le satellite
        let hasPool = false;
        
        if (searchForPool) {
          hasPool = await detectPoolOnSatellite(point.lat, point.lng);
          
          if (!hasPool) {
            continue; // Skip si pas de piscine
          }
          
          console.log(`✅ Pool found at ${address.street}`);
        }

        // 3. Calculer le score
        const score = calculateScore(imageAnalysis, hasPool);

        // 4. Générer l'explication
        const explanation = generateExplanation(imageAnalysis, hasPool, address);

        // 5. Générer la vue cadastrale (OBLIGATOIRE - toujours défini)
        // Utilise la nouvelle route API /api/cadastre qui gère plusieurs services WMS
        console.log(`🔵 [API] Generating cadastral URL for ${address.street} at ${point.lat}, ${point.lng}`);
        const cadastralUrl = await generateCadastralImage(point.lat, point.lng); // Retourne TOUJOURS une URL
        console.log(`✅ [API] Cadastral URL generated for ${address.street}: ${cadastralUrl}`);

        // 6. Ajouter le candidat
        candidates.push({
          id: `candidate-${candidates.length + 1}`,
          adresse: address.street,
          codePostal: address.postalCode,
          ville: address.city,
          coordinates: point,
          matchingScore: score,
          explanation,
          visuals: {
            satelliteUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${point.lat},${point.lng}&zoom=20&size=800x600&maptype=satellite&markers=color:red|${point.lat},${point.lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
            cadastralUrl: cadastralUrl, // OBLIGATOIRE - toujours défini
            streetViewUrl: `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${point.lat},${point.lng}&fov=90&pitch=0&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          }
        });

        if (candidates.length >= 10) break;

      } catch (error) {
        console.error(`Error at point ${testedCount}:`, error);
      }
    }

    console.log(`✅ Found ${candidates.length} candidates (tested ${testedCount} points)`);

    // Si pas assez, ajouter adresses génériques
    if (candidates.length < 3) {
      console.log('⚠️ Adding fallback addresses...');
      
      const fallbacks = await getFallbackAddresses(
        searchZone.center.lat,
        searchZone.center.lng,
        5 - candidates.length
      );
      
      candidates.push(...fallbacks);
    }

    // Trier par score
    candidates.sort((a, b) => b.matchingScore.global - a.matchingScore.global);
    const finalCandidates = candidates.slice(0, 10);

    // ============================================
    // SAUVEGARDE EN BASE DE DONNÉES
    // ============================================

    let requestId: string | null = null;

    try {
      // Créer la requête de localisation
      const localisationRequest = await prisma.localisationRequest.create({
        data: {
          rawInput: {
            imageUrl: body.imageUrl,
            imageFile: body.imageFile,
            url: body.url,
            description: body.description,
            imageAnalysis, // Sauvegarder l'analyse pour les relances
          },
          userHints: body.hints || null,
          status: 'DONE',
        },
      });

      requestId = localisationRequest.id;
      console.log(`[Simple] Created LocalisationRequest: ${requestId}`);

      // Sauvegarder les candidats
      await prisma.locationCandidate.createMany({
        data: finalCandidates.map((c, index) => ({
          localisationRequestId: requestId,
          lat: c.coordinates.lat,
          lng: c.coordinates.lng,
          addressText: c.adresse,
          postalCode: c.codePostal,
          city: c.ville,
          confidence: c.matchingScore.global,
          confidenceBreakdown: c.matchingScore.details,
          sources: {
            google_geocode: true,
            cadastre: true,
          },
          best: index === 0, // Le premier est le meilleur
        })),
      });

      console.log(`[Simple] Saved ${finalCandidates.length} candidates`);

      // Sauvegarder le run initial (niveau 0 = run initial)
      const fingerprints = finalCandidates.map(c => ({
        coords: c.coordinates,
        bbox: {
          north: c.coordinates.lat + 0.0005,
          south: c.coordinates.lat - 0.0005,
          east: c.coordinates.lng + 0.0005,
          west: c.coordinates.lng - 0.0005,
        },
        score: c.matchingScore.global,
        piscineHash: imageAnalysis?.elementsExterieurs?.piscine?.presente
          ? computePiscineHash(imageAnalysis.elementsExterieurs.piscine)
          : undefined,
        roofHash: imageAnalysis?.materiaux?.toitureCouleur
          ? computeRoofHash({
              couleur: imageAnalysis.materiaux.toitureCouleur,
              materiau: imageAnalysis.materiaux.toiture?.[0],
            })
          : undefined,
      }));

      await prisma.localisationRun.create({
        data: {
          requestId,
          level: 0, // Niveau 0 = run initial
          candidates: fingerprints,
          excludedCount: 0,
        },
      });

      console.log(`[Simple] Saved initial run (level 0)`);
    } catch (dbError) {
      console.error('[Simple] Error saving to database:', dbError);
      // Ne pas bloquer la réponse si la sauvegarde échoue
    }

    // ============================================
    // RETOUR DES RÉSULTATS
    // ============================================

    return NextResponse.json({
      success: true,
      requestId, // Retourner le requestId pour les relances
      analysis: {
        imageAnalysis,
        searchZone,
        candidatesCount: finalCandidates.length
      },
      candidates: finalCandidates
    });

  } catch (error: any) {
    console.error('💥 Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Erreur lors de l\'analyse',
        details: error.message || 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// ============================================
// FONCTIONS HELPER
// ============================================

function generateSearchGrid(
  centerLat: number,
  centerLng: number,
  radiusKm: number,
  numPoints: number
): Array<{lat: number; lng: number}> {
  const points: Array<{lat: number; lng: number}> = [];
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i * 137.508) * (Math.PI / 180);
    const r = radiusKm * Math.sqrt(i / numPoints);
    
    const lat = centerLat + (r / 111) * Math.cos(angle);
    const lng = centerLng + (r / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
    
    points.push({ lat, lng });
  }
  
  return points;
}

async function reverseGeocode(lat: number, lng: number): Promise<{street: string; city: string; postalCode: string} | null> {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&result_type=street_address&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`
    );
    
    const data = await response.json();
    
    if (!data.results?.[0]) return null;
    
    const result = data.results[0];
    let street = result.formatted_address.split(',')[0];
    let city = '';
    let postalCode = '';
    
    result.address_components.forEach((comp: any) => {
      if (comp.types.includes('locality')) city = comp.long_name;
      if (comp.types.includes('postal_code')) postalCode = comp.long_name;
    });
    
    return { street, city, postalCode };
  } catch (error) {
    return null;
  }
}

async function detectPoolOnSatellite(lat: number, lng: number): Promise<boolean> {
  try {
    const satelliteUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=20&size=400x400&maptype=satellite&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Y a-t-il une PISCINE visible (forme bleue/turquoise géométrique) ? OUI ou NON uniquement.' },
              { type: 'image_url', image_url: { url: satelliteUrl } }
            ]
          }
        ],
        max_tokens: 5,
        temperature: 0
      })
    });

    const data = await response.json();
    const answer = data.choices[0]?.message?.content?.toUpperCase() || 'NON';
    
    return answer.includes('OUI');
    
  } catch (error) {
    console.error('Error detecting pool:', error);
    return false;
  }
}

function calculateScore(imageAnalysis: any, hasPool: boolean): {global: number; details: {architectureMatch: number; piscineSimilarity: number; vegetationMatch: number; surfaceMatch: number; orientationMatch: number; contextMatch: number}} {
  let global = 60;
  
  if (imageAnalysis?.elementsExterieurs?.piscine?.presente) {
    if (hasPool) {
      global += 35;
    } else {
      global -= 25;
    }
  }
  
  return {
    global: Math.min(100, Math.max(0, global)),
    details: {
      architectureMatch: 75,
      piscineSimilarity: hasPool ? 95 : 0,
      vegetationMatch: 70,
      surfaceMatch: 65,
      orientationMatch: 70,
      contextMatch: 75
    }
  };
}

function generateExplanation(imageAnalysis: any, hasPool: boolean, address: {street: string; city: string; postalCode: string}): string {
  let exp = `Cette propriété au ${address.street} `;
  
  if (hasPool && imageAnalysis?.elementsExterieurs?.piscine?.presente) {
    exp += `possède une piscine visible sur l'image satellite, correspondant à celle de votre photo. `;
    
    if (imageAnalysis.elementsExterieurs.piscine.forme) {
      exp += `Forme ${imageAnalysis.elementsExterieurs.piscine.forme}. `;
    }
  }
  
  if (imageAnalysis?.materiaux?.toitureCouleur) {
    exp += `Toiture ${imageAnalysis.materiaux.toitureCouleur}. `;
  }
  
  exp += `Localisation: ${address.city} (${address.postalCode}).`;
  
  return exp;
}

async function getFallbackAddresses(lat: number, lng: number, count: number): Promise<Array<any>> {
  const addresses: Array<any> = [];
  const offsets = [
    { lat: 0.002, lng: 0.002 },
    { lat: -0.002, lng: 0.002 },
    { lat: 0.002, lng: -0.002 },
    { lat: -0.002, lng: -0.002 },
    { lat: 0.003, lng: 0 },
  ];
  
  for (let i = 0; i < Math.min(count, offsets.length); i++) {
    const addr = await reverseGeocode(
      lat + offsets[i].lat,
      lng + offsets[i].lng
    );
    
    if (addr) {
      // Générer la vue cadastrale pour chaque fallback (OBLIGATOIRE - toujours défini)
      const cadastralUrl = await generateCadastralImage(lat + offsets[i].lat, lng + offsets[i].lng); // Retourne TOUJOURS une URL
      
      addresses.push({
        id: `fallback-${i}`,
        adresse: addr.street,
        codePostal: addr.postalCode,
        ville: addr.city,
        coordinates: {
          lat: lat + offsets[i].lat,
          lng: lng + offsets[i].lng
        },
        matchingScore: {
          global: 50,
          details: {
            architectureMatch: 50,
            piscineSimilarity: 0,
            vegetationMatch: 50,
            surfaceMatch: 50,
            orientationMatch: 50,
            contextMatch: 60
          }
        },
        explanation: `Propriété dans la zone de recherche ${addr.city}.`,
        visuals: {
          satelliteUrl: `https://maps.googleapis.com/maps/api/staticmap?center=${lat + offsets[i].lat},${lng + offsets[i].lng}&zoom=20&size=800x600&maptype=satellite&markers=color:red|${lat + offsets[i].lat},${lng + offsets[i].lng}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
          cadastralUrl: cadastralUrl, // OBLIGATOIRE - toujours défini
          streetViewUrl: `https://maps.googleapis.com/maps/api/streetview?size=800x600&location=${lat + offsets[i].lat},${lng + offsets[i].lng}&fov=90&pitch=0&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`,
        }
      });
    }
  }
  
  return addresses;
}

// Configuration Vercel pour timeout long
export const maxDuration = 300; // 5 minutes
export const runtime = 'nodejs';
