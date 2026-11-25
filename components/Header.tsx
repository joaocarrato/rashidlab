"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";

const TABS = [
  ["/", "Hoje"],
  ["/antes", "Antes da partida"],
  ["/partidas", "Partidas"],
  ["/combos", "Combos"],
  ["/matchups", "Matchups"],
  ["/fluxo", "Fluxograma"],
  ["/videos", "Vídeos"],
  ["/backup", "Backup"],
  ["/conta", "Conta"],
] as const;

const BARE = ["/login", "/setup", "/auth"];

export default function Header() {
  const path = usePathname();
  if (BARE.some((p) => path === p || path.startsWith(p + "/"))) return null;
  const on = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  return (
    <>
      <header className="top">
        <h1>
          Rashid <span>Lab</span>
        </h1>
        <span className="spacer" />
        <form action={signOut}>
          <button className="ghost">Sair</button>
        </form>
      </header>
      <nav className="tabs" aria-label="Seções">
        {TABS.map(([href, label]) => (
          <Link key={href} href={href} className={on(href) ? "on" : ""} aria-current={on(href) ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
