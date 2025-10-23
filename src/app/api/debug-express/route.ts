import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  const ZENROWS_KEY = process.env.ZENROWS_API_KEY;
  const { searchParams } = new URL(request.url);
  const ville = searchParams.get('ville') || 'Paris';
  const targetUrl = `https://www.leboncoin.fr/recherche?category=9&locations=${encodeURIComponent(ville)}`;

  try {
    console.log("🧠 Debug LeBonCoin URL :", targetUrl);

    const { data: html } = await axios.get("https://api.zenrows.com/v1/", {
      params: {
        apikey: ZENROWS_KEY,
        url: targetUrl,
        js_render: "true",
        premium_proxy: "true",
        wait: "8000",
      },
    });

    console.log("✅ HTML reçu :", html.length, "caractères");

    // Coupe le HTML pour inspection
    const extrait = html.substring(0, 2000);

    return NextResponse.json({
      success: true,
      message: "Debug HTML récupéré avec succès",
      data: {
        extrait,
        length: html.length,
        targetUrl,
        ville,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error("❌ Erreur ZenRows :", error.response?.status, error.message);
    return NextResponse.json({
      success: false,
      status: error.response?.status,
      message: error.message,
      data: error.response?.data || null,
      targetUrl,
      ville,
    }, { status: 500 });
  }
}


