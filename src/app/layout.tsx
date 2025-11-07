import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { CustomCursor } from "@/components/custom-cursor";
import { Toaster } from "@/components/ui/sonner";
import ChatWidget from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <CustomCursor>
          <Navbar />
          {children}
        </CustomCursor>
        <ChatWidget />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
