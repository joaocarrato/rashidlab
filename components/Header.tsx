"use client";

import type { CSSProperties } from "react";
import { useRef, useTransition } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/app/login/actions";
import { pickMain } from "@/app/actions";
import { APP, charColor } from "@/lib/constants";

const TABS = [
  ["/", "Hoje"],
  ["/antes", "Antes da luta"],
  ["/partidas", "Partidas"],
  ["/combos", "Combos"],
  ["/matchups", "Matchups"],
  ["/fluxo", "Fluxograma"],
  ["/videos", "Vídeos"],
] as const;

const BARE = ["/login", "/setup", "/auth"];

export function Logo({ size }: { size?: number }) {
  return (
    <span className="logo" style={size ? { fontSize: size } : undefined}>
      {APP.a}<span>{APP.b}</span>
    </span>
  );
}

function MainPicker({ main, mains }: { main: string | null; mains: string[] }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const [pending, start] = useTransition();
  const others = mains.filter((m) => m !== main);
  const close = () => ref.current?.removeAttribute("open");
  return (
    <details className="picker" ref={ref}>
      <summary aria-label="Trocar personagem">
        <span className="p1">P1</span>
        <span className="who">{pending ? "…" : main ?? "Escolher"}</span>
        <span className="caret" aria-hidden>▾</span>
      </summary>
      <div className="menu">
        {others.map((m) => (
          <button key={m} type="button" className="opt" style={{ "--c": charColor(m) } as CSSProperties}
            onClick={() => { close(); start(() => pickMain(m)); }}>
            {m}
          </button>
        ))}
        <Link className="opt more" href="/personagens" onClick={close}>
          {mains.length ? "Seleção de personagens" : "Escolher personagem"}
        </Link>
      </div>
    </details>
  );
}

export default function Header({ main, mains }: { main: string | null; mains: string[] }) {
  const path = usePathname();
  if (BARE.some((p) => path === p || path.startsWith(p + "/"))) return null;
  const on = (href: string) => (href === "/" ? path === "/" : path === href || path.startsWith(href + "/"));
  return (
    <>
      <header className="top">
        <Link href="/" className="home" aria-label={`${APP.name}, início`}><Logo /></Link>
        <MainPicker main={main} mains={mains} />
        <span className="spacer" />
        <nav className="util" aria-label="Conta">
          <Link href="/backup" className={on("/backup") ? "on" : ""}>Backup</Link>
          <Link href="/conta" className={on("/conta") ? "on" : ""}>Conta</Link>
          <form action={signOut}><button className="ghost">Sair</button></form>
        </nav>
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
