import { NextRequest, NextResponse } from "next/server";
import { leboncoinZenRowsScraper } from "@/lib/scrapers/leboncoin-zenrows";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("🔍 Scraper LeBonCoin - Paramètres reçus:", body);
    
    const data = await leboncoinZenRowsScraper.scrapeAnnonces(body);
    
    console.log(`✅ Scraper terminé: ${data.length} annonces trouvées`);
    
    return NextResponse.json({ 
      status: "success", 
      count: data.length, 
      annonces: data,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    console.error("❌ Scraper error:", err);
    return NextResponse.json({ 
      status: "error", 
      message: String(err),
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


