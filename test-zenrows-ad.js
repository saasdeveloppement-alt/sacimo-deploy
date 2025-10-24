import fetch from "node-fetch";

const zenrowsUrl = new URL("https://api.zenrows.com/v1/");
zenrowsUrl.searchParams.set("apikey", "d3b645718fe52aa686631ef96ef5833b6f73065e");
zenrowsUrl.searchParams.set("url", "https://www.leboncoin.fr/");
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
