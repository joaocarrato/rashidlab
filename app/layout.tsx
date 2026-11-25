import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";

const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], weight: ["500", "700"] });
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["500"] });

export const metadata: Metadata = {
  title: { default: "Rashid Lab", template: "%s · Rashid Lab" },
  description: "Caderno de treino de Rashid no Street Fighter 6: partidas, combos, matchups, vídeos e fluxogramas.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef2f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1514" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${space.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <div className="wrap">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
