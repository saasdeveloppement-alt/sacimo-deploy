/**
 * Service d'analyse IA d'images immobilières
 * Utilise OpenAI Vision + Google Vision API en parallèle
 * 
 * NOUVEAU : Génère une VisualSignature focalisée sur la piscine
 */

import type { ImageAnalysisResult, VisualSignature } from '@/types/localisation-advanced';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GOOGLE_VISION_API_KEY = process.env.GOOGLE_VISION_API_KEY;

/**
 * Analyse une image avec OpenAI Vision
 */
async function analyzeWithOpenAI(imageUrl: string): Promise<Partial<ImageAnalysisResult>> {
  if (!OPENAI_API_KEY) {
    console.warn('OpenAI API key not configured');
    return {};
  }

  const systemPrompt = `Tu es un expert en analyse immobilière et architecturale. 
Analyse cette photo de bien immobilier et extrais TOUTES les informations visuelles pertinentes pour 
permettre une géolocalisation précise.

Focus sur :
1. Type et style architectural (époque, région typique)
2. Matériaux de construction (façade, toiture)
3. Éléments extérieurs UNIQUES (piscine avec forme exacte, arbres remarquables, etc.)
4. Indices climatiques et géographiques (végétation, exposition soleil)
5. Tout détail qui pourrait être unique à cette propriété

Retourne une analyse structurée en JSON avec un score de confiance pour chaque élément.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyse cette image de bien immobilier et retourne un JSON structuré avec toutes les caractéristiques visuelles.',
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl },
              },
            ],
          },
        ],
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    return {};
  }
}

/**
 * Analyse une image avec Google Vision API
 */
async function analyzeWithGoogleVision(imageUrl: string): Promise<Partial<ImageAnalysisResult>> {
  if (!GOOGLE_VISION_API_KEY) {
    console.warn('Google Vision API key not configured');
    return {};
  }

  try {
    // Détection de labels et landmarks
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${GOOGLE_VISION_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                source: { imageUri: imageUrl },
              },
              features: [
                { type: 'LABEL_DETECTION', maxResults: 20 },
                { type: 'LANDMARK_DETECTION', maxResults: 5 },
                { type: 'TEXT_DETECTION' },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Google Vision API error: ${response.statusText}`);
    }

    const data = await response.json();
    const annotations = data.responses[0];

    // Extraction des informations pertinentes
    const labels = annotations.labelAnnotations || [];
    const landmarks = annotations.landmarkAnnotations || [];
    const text = annotations.textAnnotations?.[0]?.description || '';

    // Analyse des labels pour détecter des indices
    const detectedElements: Partial<ImageAnalysisResult> = {
      elementsExterieurs: {},
      indicesGeographiques: {
        climat: 'inconnu',
        vegetation: [],
        altitude: 'inconnu',
        proximite: [],
      },
      signesDistinctifs: [],
    };

    // Détection piscine
    const poolLabels = labels.filter((l: any) => 
      l.description?.toLowerCase().includes('pool') || 
      l.description?.toLowerCase().includes('piscine')
    );
    if (poolLabels.length > 0) {
      detectedElements.elementsExterieurs!.piscine = {
        presente: true,
        forme: 'inconnue',
        position: 'inconnue',
      };
    }

    // Détection végétation
    const vegetationLabels = labels.filter((l: any) => 
      ['palm', 'pine', 'tree', 'garden', 'vegetation'].some(v => 
        l.description?.toLowerCase().includes(v)
      )
    );
    if (vegetationLabels.length > 0) {
      detectedElements.elementsExterieurs!.jardin = {
        present: true,
        surface: 'inconnu',
        vegetation: vegetationLabels.map((l: any) => l.description),
      };
      detectedElements.indicesGeographiques!.vegetation = 
        vegetationLabels.map((l: any) => l.description);
    }

    // Détection climat via végétation
    if (vegetationLabels.some((l: any) => l.description?.toLowerCase().includes('palm'))) {
      detectedElements.indicesGeographiques!.climat = 'méditerranéen';
    }

    return detectedElements;
  } catch (error) {
    console.error('Google Vision analysis error:', error);
    return {};
  }
}

/**
 * Fusion intelligente des résultats OpenAI et Google Vision
 */
function mergeAnalysisResults(
  openaiResult: Partial<ImageAnalysisResult>,
  googleResult: Partial<ImageAnalysisResult>
): ImageAnalysisResult {
  // Valeurs par défaut
  const merged: ImageAnalysisResult = {
    typeBien: 'inconnu',
    styleArchitectural: '',
    materiaux: {
      facade: [],
      toiture: [],
    },
    elementsExterieurs: {
      piscine: googleResult.elementsExterieurs?.piscine || {
        presente: false,
        forme: 'inconnue',
        position: 'inconnue',
      },
      jardin: googleResult.elementsExterieurs?.jardin || {
        present: false,
        surface: 'inconnu',
        vegetation: [],
      },
    },
    indicesGeographiques: googleResult.indicesGeographiques || {
      climat: 'inconnu',
      vegetation: [],
      altitude: 'inconnu',
      proximite: [],
    },
    signesDistinctifs: openaiResult.signesDistinctifs || [],
    confidenceScore: 0,
    // Initialiser les détections explicites
    hasPoolFromImage: false,
    poolConfidenceImage: 0,
    hasGardenFromImage: false,
    gardenConfidenceImage: 0,
  };

  // Fusion des données OpenAI (priorité)
  if (openaiResult.typeBien) merged.typeBien = openaiResult.typeBien;
  if (openaiResult.styleArchitectural) merged.styleArchitectural = openaiResult.styleArchitectural;
  if (openaiResult.materiaux) merged.materiaux = { ...merged.materiaux, ...openaiResult.materiaux };
  if (openaiResult.elementsExterieurs) {
    merged.elementsExterieurs = { ...merged.elementsExterieurs, ...openaiResult.elementsExterieurs };
  }
  if (openaiResult.orientation) merged.orientation = openaiResult.orientation;
  if (openaiResult.metadata) merged.metadata = openaiResult.metadata;

  // DÉTECTION EXPLICITE DE PISCINE : Fusionner les résultats OpenAI et Google Vision
  const hasPoolOpenAI = openaiResult.elementsExterieurs?.piscine?.presente || false;
  const hasPoolGoogle = googleResult.elementsExterieurs?.piscine?.presente || false;
  const hasPoolFromImage = hasPoolOpenAI || hasPoolGoogle; // Si l'un des deux détecte, on considère qu'il y a une piscine
  
  // Calculer un score de confiance pour la piscine
  let poolConfidenceImage = 0;
  if (hasPoolOpenAI && hasPoolGoogle) {
    poolConfidenceImage = 0.9; // Les deux détectent → très confiant
  } else if (hasPoolOpenAI || hasPoolGoogle) {
    poolConfidenceImage = 0.7; // Un seul détecte → confiance moyenne
  }
  
  // DÉTECTION EXPLICITE DE JARDIN : Fusionner les résultats OpenAI et Google Vision
  const hasGardenOpenAI = openaiResult.elementsExterieurs?.jardin?.present || false;
  const hasGardenGoogle = googleResult.elementsExterieurs?.jardin?.present || false;
  const hasGardenFromImage = hasGardenOpenAI || hasGardenGoogle;
  
  // Calculer un score de confiance pour le jardin
  let gardenConfidenceImage = 0;
  if (hasGardenOpenAI && hasGardenGoogle) {
    gardenConfidenceImage = 0.9; // Les deux détectent → très confiant
  } else if (hasGardenOpenAI || hasGardenGoogle) {
    gardenConfidenceImage = 0.7; // Un seul détecte → confiance moyenne
  }
  
  // Mettre à jour le champ piscine avec les informations fusionnées
  if (hasPoolFromImage) {
    merged.elementsExterieurs.piscine = {
      presente: true,
      forme: openaiResult.elementsExterieurs?.piscine?.forme || 
             googleResult.elementsExterieurs?.piscine?.forme || 
             'inconnue',
      position: openaiResult.elementsExterieurs?.piscine?.position || 
                googleResult.elementsExterieurs?.piscine?.position || 
                'inconnue',
    };
  }
  
  // Mettre à jour le champ jardin avec les informations fusionnées
  if (hasGardenFromImage) {
    merged.elementsExterieurs.jardin = {
      present: true,
      surface: openaiResult.elementsExterieurs?.jardin?.surface || 
               googleResult.elementsExterieurs?.jardin?.surface || 
               'inconnu',
      vegetation: [
        ...(openaiResult.elementsExterieurs?.jardin?.vegetation || []),
        ...(googleResult.elementsExterieurs?.jardin?.vegetation || [])
      ],
    };
  }
  
  // Log de la détection de piscine et jardin
  console.log(`[ANALYSE_IMAGE] Piscine détectée: ${hasPoolFromImage}, score=${poolConfidenceImage.toFixed(2)} (OpenAI: ${hasPoolOpenAI}, Google: ${hasPoolGoogle})`);
  console.log(`[ANALYSE_IMAGE] Jardin détecté: ${hasGardenFromImage}, score=${gardenConfidenceImage.toFixed(2)} (OpenAI: ${hasGardenOpenAI}, Google: ${hasGardenGoogle})`);
  
  // Ajouter les champs explicites pour la piscine et le jardin (pour compatibilité avec le reste du code)
  merged.hasPoolFromImage = hasPoolFromImage;
  merged.poolConfidenceImage = poolConfidenceImage;
  merged.hasGardenFromImage = hasGardenFromImage;
  merged.gardenConfidenceImage = gardenConfidenceImage;

  // Calcul du score de confiance
  let confidence = 0;
  if (merged.typeBien !== 'inconnu') confidence += 20;
  if (merged.styleArchitectural) confidence += 15;
  if (merged.elementsExterieurs.piscine?.presente) confidence += 25;
  if (merged.elementsExterieurs.jardin?.present) confidence += 15;
  if (merged.indicesGeographiques.climat !== 'inconnu') confidence += 15;
  if (merged.signesDistinctifs.length > 0) confidence += 10;
  
  merged.confidenceScore = Math.min(100, confidence);

  return merged;
}

/**
 * Fonction principale d'analyse d'image
 */
export async function analyzePropertyImage(
  imageUrl: string
): Promise<ImageAnalysisResult> {
  console.log('[ImageAnalysis] Starting analysis for:', imageUrl);

  // Analyses parallèles
  const [openaiAnalysis, googleAnalysis] = await Promise.all([
    analyzeWithOpenAI(imageUrl),
    analyzeWithGoogleVision(imageUrl),
  ]);

  // Fusion intelligente
  const result = mergeAnalysisResults(openaiAnalysis, googleAnalysis);

  console.log('[ImageAnalysis] Analysis complete, confidence:', result.confidenceScore);

  return result;
}

/**
 * NOUVEAU : Extrait une VisualSignature focalisée sur la piscine
 * Cette signature sera utilisée pour matcher avec les candidats
 */
export async function extractVisualSignature(
  imageUrl: string
): Promise<VisualSignature> {
  console.log('[ImageAnalysis] Extracting visual signature (pool-focused)...');

  // Utiliser OpenAI Vision avec un prompt ultra-précis sur la piscine
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
  
  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured');
  }

  const systemPrompt = `Tu es un expert en analyse immobilière avec une spécialisation en géolocalisation par imagerie.

Analyse cette photo de bien immobilier avec une EXTRÊME PRÉCISION sur les détails visuels, en particulier la PISCINE.

# CRITÈRES D'ANALYSE PRIORITAIRES

## 1. PISCINE (ULTRA CRITIQUE - facteur discriminant principal)
- Présence : OUI/NON avec certitude absolue
- Forme EXACTE : rectangulaire / carrée / ronde / haricot / forme-L / personnalisée
- Dimensions approximatives : longueur x largeur en mètres (ex: 10m x 4m)
- Couleur de l'eau : bleu clair / bleu foncé / turquoise / verte
- Bordure : carrelage / pierre / bois / béton
- Position par rapport à la maison : derrière / côté gauche / côté droit / devant
- Éléments annexes : plage / terrasse autour / pool house / abri

## 2. TOITURE (TRÈS IMPORTANT)
- Matériau : tuiles / ardoise / zinc / terrasse / végétalisée
- Couleur PRÉCISE : rouge / orange / marron / gris / noir / autre
- État visible : neuf / ancien / refait récemment
- Forme : 2 pans / 4 pans / terrasse plate / complexe

## 3. FAÇADES
- Couleur dominante : blanc / beige / gris / pierre apparente / autre
- Matériau : crépi / pierre / brique / bois / mixte

## 4. JARDIN & VÉGÉTATION
- Types d'arbres : pins / palmiers / feuillus / fruitiers / haie
- Pelouse : oui/non, état

## 5. ÉLÉMENTS DISTINCTIFS UNIQUES
Liste TOUS les détails qui rendent cette propriété unique.

# FORMAT DE RÉPONSE

Retourne UNIQUEMENT un JSON avec cette structure EXACTE :

{
  "hasPool": true/false,
  "poolShape": "rectangular" | "kidney" | "L" | "round" | "unknown",
  "poolOrientation": 0-360 (angle approximatif),
  "poolSizeCategory": "small" | "medium" | "large",
  "poolStyle": {
    "color": "blue" | "turquoise" | "green" | "unknown",
    "border": "tile" | "stone" | "wood" | "concrete" | "unknown",
    "position": "behind" | "left" | "right" | "front",
    "features": ["détail1", "détail2"]
  },
  "houseStories": 1 | 2 | 3,
  "roofType": "tile_red" | "tile_flat" | "slate" | "flat" | "unknown",
  "roofColor": "couleur exacte",
  "facadeColor": "white" | "beige" | "stone" | "other",
  "facadeMaterial": ["matériau1", "matériau2"],
  "vegetationHints": ["type1", "type2"],
  "otherNotableFeatures": ["détail1", "détail2"],
  "confidence": 0-100
}

# RÈGLES CRITIQUES

1. Sois ULTRA PRÉCIS sur la piscine (forme, couleur, position)
2. Note TOUS les détails de couleur (toit, façade, volets)
3. Identifie TOUS les éléments uniques visibles
4. Si tu n'es pas sûr d'un élément, mets une confidence basse mais donne ton meilleure estimation
5. NE PAS inventer : si invisible, marque comme "unknown"`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o', // Le meilleur modèle vision
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: systemPrompt },
              { type: 'image_url', image_url: { url: imageUrl, detail: 'high' } },
            ],
          },
        ],
        max_tokens: 2000,
        temperature: 0.3, // Bas pour précision maximale
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    // Parser le JSON
    const signature = JSON.parse(content);

    // Valider et normaliser
    const visualSignature: VisualSignature = {
      hasPool: signature.hasPool === true,
      poolShape: signature.poolShape || 'unknown',
      poolOrientation: signature.poolOrientation,
      poolSizeCategory: signature.poolSizeCategory || 'unknown',
      poolStyle: signature.poolStyle || {},
      houseStories: signature.houseStories,
      roofType: signature.roofType || 'unknown',
      roofColor: signature.roofColor,
      facadeColor: signature.facadeColor || 'other',
      facadeMaterial: signature.facadeMaterial || [],
      vegetationHints: signature.vegetationHints || [],
      otherNotableFeatures: signature.otherNotableFeatures || [],
      confidence: signature.confidence || 0,
    };

    console.log('[ImageAnalysis] Visual signature extracted:', {
      hasPool: visualSignature.hasPool,
      poolShape: visualSignature.poolShape,
      confidence: visualSignature.confidence,
    });

    return visualSignature;
  } catch (error) {
    console.error('[ImageAnalysis] Error extracting visual signature:', error);
    // Fallback : signature minimale
    return {
      hasPool: false,
      poolShape: 'unknown',
      confidence: 0,
    };
  }
}

