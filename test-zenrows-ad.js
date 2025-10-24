import fetch from "node-fetch";

const zenrowsUrl = new URL("https://api.zenrows.com/v1/");
zenrowsUrl.searchParams.set("apikey", "d3b645718fe52aa686631ef96ef5833b6f73065e");
zenrowsUrl.searchParams.set("url", "https://www.leboncoin.fr/c/ventes_immobilieres");
zenrowsUrl.searchParams.set("js_render", "true");
zenrowsUrl.searchParams.set("wait", "10000");
zenrowsUrl.searchParams.set("premium_proxy", "true");
zenrowsUrl.searchParams.set("proxy_country", "FR");
zenrowsUrl.searchParams.set("wait_for", "body");
zenrowsUrl.searchParams.set("custom_headers", "true");
zenrowsUrl.searchParams.set("original_status", "true");

console.log("🔍 Requesting:", zenrowsUrl.toString().substring(0, 200));

const response = await fetch(zenrowsUrl, {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.leboncoin.fr/",
  },
});

console.log("Status:", response.status);

const html = await response.text();
console.log("HTML length:", html.length);
console.log("HTML preview:\n", html.slice(0, 800));

// Analyse de la structure HTML avec Cheerio
import * as cheerio from 'cheerio';
const $ = cheerio.load(html);

console.log("\n🔍 ANALYSE DE LA STRUCTURE HTML :");
console.log("=====================================");
console.log("Articles:", $("article").length);
console.log("Liens:", $("a").length);
console.log("Divs:", $("div").length);
console.log("data-qa-id:", $("[data-qa-id]").length);
console.log("data-test-id:", $("[data-test-id]").length);
console.log("data-qa:", $("[data-qa]").length);

// Analyser les classes communes
console.log("\n📊 CLASSES COMMUNES :");
const classes = {};
$("*").each((i, el) => {
  const className = $(el).attr('class');
  if (className) {
    className.split(' ').forEach(cls => {
      if (cls && cls.length > 0) {
        classes[cls] = (classes[cls] || 0) + 1;
      }
    });
  }
});

// Afficher les 10 classes les plus fréquentes
const sortedClasses = Object.entries(classes)
  .sort(([,a], [,b]) => b - a)
  .slice(0, 10);

console.log("Top 10 classes:");
sortedClasses.forEach(([cls, count]) => {
  console.log(`  ${cls}: ${count}`);
});

// Chercher des patterns d'annonces
console.log("\n🏠 RECHERCHE DE PATTERNS D'ANNONCES :");
console.log("Divs avec 'ad' ou 'annonce':", $("div[class*='ad'], div[class*='annonce'], div[class*='listing']").length);
console.log("Liens avec 'ad' ou 'annonce':", $("a[href*='/ventes_immobilieres/'], a[href*='/annonces/']").length);
console.log("Éléments avec prix:", $("*:contains('€'), *[class*='price'], *[class*='prix']").length);

// Afficher quelques exemples de structure
console.log("\n📋 EXEMPLES DE STRUCTURE :");
$("article, div[class*='ad'], a[href*='/ventes_immobilieres/']").slice(0, 3).each((i, el) => {
  console.log(`\nÉlément ${i + 1}:`);
  console.log("  Tag:", el.tagName);
  console.log("  Classes:", $(el).attr('class'));
  console.log("  ID:", $(el).attr('id'));
  console.log("  Data attributes:", Object.keys(el.attribs).filter(attr => attr.startsWith('data-')));
  console.log("  Text preview:", $(el).text().slice(0, 100));
});
