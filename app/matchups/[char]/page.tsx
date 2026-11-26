import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getData } from "@/lib/data";
import { charColor, charFromSlug } from "@/lib/constants";
import MatchupForm from "@/components/MatchupForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ char: string }> }): Promise<Metadata> {
  const { char } = await params;
  return { title: charFromSlug(char) ?? "Matchup" };
}

export default async function MatchupPage({ params }: { params: Promise<{ char: string }> }) {
  const { char } = await params;
  const name = charFromSlug(char);
  if (!name) notFound();
  const d = await getData(["logs", "matchups", "videos"]);
  const m = d.matchups.find((x) => x.char === name);
  const logs = d.logs.filter((l) => l.opp === name);
  const vids = d.videos.filter((v) => v.char === name);
  const w = logs.filter((l) => l.result === "W").length;

  return (
    <>
      <div className="vs" style={{ "--c": charColor(name) } as CSSProperties}>
        <div className="side me"><span className="lbl">Você</span>{d.main}</div>
        <div className="x">VS</div>
        <div className="side them"><span className="lbl">Oponente</span>{name}</div>
      </div>
      <div className="row" style={{ marginBottom: 18 }}>
        <span className="muted">
          {logs.length ? `${w}V · ${logs.length - w}D` : "Nenhuma partida registrada contra esse personagem."}
        </span>
        {logs.length > 0 && (
          <span className="streak" aria-label="Últimos resultados">
            {logs.slice(0, 10).map((l) => (
              <b key={l.id} className={`res ${l.result === "W" ? "win" : "loss"}`}>{l.result === "W" ? "V" : "D"}</b>
            ))}
          </span>
        )}
        <span className="spacer" />
        <Link className="btn" href={`/antes?opp=${encodeURIComponent(name)}`}>Ver antes da luta</Link>
      </div>
      <div className="cols">
        <MatchupForm key={d.main} char={name}
          initial={{ plan: m?.plan ?? "", avoid: m?.avoid ?? "", tools: m?.tools ?? "", notes: m?.notes ?? "" }} />
        <div>
          {logs.some((l) => l.lesson) && (
            <section>
              <h3 style={{ marginBottom: 6 }}>Lições recentes</h3>
              <ul className="plain">
                {logs.filter((l) => l.lesson).slice(0, 5).map((l) => <li key={l.id}>{l.lesson}</li>)}
              </ul>
            </section>
          )}
          {vids.length > 0 && (
            <section>
              <h3 style={{ marginBottom: 6 }}>Vídeos</h3>
              <ul className="plain">
                {vids.map((v) => (
                  <li key={v.id}><a href={v.url} target="_blank" rel="noopener noreferrer">{v.title || "abrir"}</a></li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
