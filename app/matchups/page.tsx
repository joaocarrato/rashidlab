import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getData } from "@/lib/data";
import { computeStats } from "@/lib/stats";
import { ROSTER, charColor, slug } from "@/lib/constants";

export const metadata: Metadata = { title: "Matchups" };
export const dynamic = "force-dynamic";

export default async function Matchups() {
  const d = await getData(["logs", "matchups"]);
  const { losses } = computeStats(d.logs);
  const rec = (n: string) => {
    const l = d.logs.filter((x) => x.opp === n);
    const w = l.filter((x) => x.result === "W").length;
    return { w, l: l.length - w, n: l.length };
  };
  const list = [...ROSTER].sort((a, b) => (losses[b] || 0) - (losses[a] || 0) || a.localeCompare(b));
  return (
    <>
      <div className="sec-head">
        <h2>Matchups</h2><span className="muted small">{d.main} contra o elenco · ordenado por derrotas</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 180px), 1fr))", gap: 10 }}>
        {list.map((n) => {
          const r = rec(n);
          const m = d.matchups.find((x) => x.char === n);
          return (
            <Link key={n} href={`/matchups/${slug(n)}`} className="mu" style={{ "--c": charColor(n) } as CSSProperties}>
              {m?.plan && <span className="plan">Plano</span>}
              <span className="nm">{n}{n === d.main ? <span className="muted small"> espelho</span> : null}</span>
              <span className="rec">{r.n ? `${r.w}V · ${r.l}D` : "sem partidas"}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
