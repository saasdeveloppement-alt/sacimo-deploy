"use client";
import { useEffect, useState } from "react";

export default function TestIndividualAds() {
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("⏳ Test scraping en cours...");
      const res = await fetch("/api/test-individual-ads");
      if (!res.ok) throw new Error("Erreur API");
      const json = await res.json();
      console.log("📦 Données reçues :", json);
      const data = json.annonces || json.data || [];
      setAnnonces(data);
      console.log(`✅ ${data.length} annonces extraites`);
    } catch (err: any) {
      console.error("💥 Erreur de scraping :", err);
      setError(err.message || "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>📋 Test du Scraper LeBonCoin</h1>

      {loading && <p>⏳ Chargement en cours...</p>}
      {error && <p style={{ color: "red" }}>❌ Erreur : {error}</p>}
      {!loading && !error && annonces.length === 0 && <p>⚠️ Aucune annonce trouvée.</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
          gap: "1rem",
          marginTop: "2rem",
        }}
      >
        {annonces.map((a, i) => (
          <div
            key={i}
            style={{
              border: "1px solid #ccc",
              borderRadius: "8px",
              overflow: "hidden",
              boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
            }}
          >
            {a.image && (
              <img
                src={a.image}
                alt={a.title || "Annonce"}
                style={{ width: "100%", height: "160px", objectFit: "cover" }}
              />
            )}
            <div style={{ padding: "1rem" }}>
              <h3 style={{ marginBottom: "0.5rem" }}>{a.title || "Sans titre"}</h3>
              <p style={{ margin: 0 }}>{a.price || "Prix non précisé"}</p>
              <p style={{ margin: 0 }}>{a.surface || ""}</p>
              <a
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0070f3", textDecoration: "underline" }}
              >
                Voir l'annonce →
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}