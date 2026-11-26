import type { CSSProperties } from "react";
import type { Metadata, Viewport } from "next";
import { Barlow, Barlow_Condensed, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import { APP, charColor } from "@/lib/constants";
import { getShell } from "@/lib/main";

const cond = Barlow_Condensed({ variable: "--font-cond", subsets: ["latin"], weight: ["600", "700", "800", "900"], style: ["normal", "italic"] });
const body = Barlow({ variable: "--font-body", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin"], weight: ["500", "700"] });

export const metadata: Metadata = {
  title: { default: APP.name, template: `%s · ${APP.name}` },
  description: `${APP.tagline}: partidas, combos, matchups, vídeos e fluxogramas, separados por personagem.`,
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  viewportFit: "cover",
  themeColor: "#0C0507",
  colorScheme: "dark",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { main, mains } = await getShell();
  return (
    <html lang="pt-BR" className={`${cond.variable} ${body.variable} ${mono.variable}`}>
      <body style={{ "--accent": charColor(main) } as CSSProperties}>
        <div className="wrap">
          <Header main={main} mains={mains} />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
