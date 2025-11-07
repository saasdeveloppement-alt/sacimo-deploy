import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CustomCursor } from "@/components/custom-cursor";
import { Toaster } from "@/components/ui/sonner";
import ChatWidget from "@/components/ChatWidget";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "SACIMO - Veille immobilière automatisée",
  description: "Ne ratez plus aucune opportunité immobilière. SACIMO surveille en continu les nouvelles annonces selon vos critères et vous envoie un rapport quotidien personnalisé.",
  keywords: "immobilier, veille, annonces, LeBonCoin, agence immobilière, reporting, automatisation",
  authors: [{ name: "SACIMO" }],
  openGraph: {
    title: "SACIMO - Veille immobilière automatisée",
    description: "Ne ratez plus aucune opportunité immobilière. Surveillance continue et rapports quotidiens personnalisés.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={inter.variable}>
      <body
        className={`${inter.className} antialiased`}
      >
        <CustomCursor>
          {children}
        </CustomCursor>
        <ChatWidget />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
