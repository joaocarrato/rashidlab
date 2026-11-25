import type { Metadata } from "next";
import Link from "next/link";
import { getAll } from "@/lib/data";
import { computeStats } from "@/lib/stats";
import { ROSTER, isChar, slug } from "@/lib/constants";
import { createMatchupFlow } from "@/app/actions";
import FlowView from "@/components/FlowView";
import { ActionButton, OppSelect } from "@/components/small";

export const metadata: Metadata = { title: "Antes da partida" };
export const dynamic = "force-dynamic";

function Block({ t, x, edit }: { t: string; x?: string; edit: string }) {
  return (
    <section className="panel">
      <h3 style={{ marginBottom: 6 }}>{t}</h3>
      {x ? <div className="pre">{x}</div> : <div className="muted small">Vazio. <Link href={edit}>Escrever</Link></div>}
    </section>
  );
}

export default async function Antes({ searchParams }: { searchParams: Promise<{ opp?: string }> }) {
  const { opp } = await searchParams;
  const d = await getAll();
  const { sorted } = computeStats(d.logs);
  const name = opp && isChar(opp) ? opp : sorted[0]?.opp ?? ROSTER[0];
  const m = d.matchups.find((x) => x.char === name);
  const ls = sorted.filter((l) => l.opp === name);
  const w = ls.filter((l) => l.result === "W").length;
  const flows = d.flows.filter((f) => f.char === name);
  const vids = d.videos.filter((v) => v.char === name);
  const lessons = ls.filter((l) => l.lesson).slice(0, 3);
  const edit = `/matchups/${slug(name)}`;

  return (
    <>
      <div className="sec-head">
        <h2>Antes da partida</h2><span className="spacer" />
        <div style={{ width: 220 }}><label htmlFor="pre">Oponente</label><OppSelect value={name} /></div>
      </div>
      <p className="muted" style={{ margin: "0 0 16px" }}>
        {ls.length ? `Você tem ${w}V e ${ls.length - w}D contra ${name}.` : `Nenhuma partida registrada contra ${name}.`}{" "}
        <Link href={edit}>Editar matchup</Link>
      </p>
      <div className="grid" style={{ marginBottom: 24 }}>
        <Block t="Como eu ganho" x={m?.plan} edit={edit} />
        <Block t="O que me faz perder" x={m?.avoid} edit={edit} />
        <Block t="Respostas prontas" x={m?.tools} edit={edit} />
      </div>
      {lessons.length > 0 && (
        <section>
          <h3 style={{ marginBottom: 6 }}>Suas últimas lições</h3>
          <ul className="plain">{lessons.map((l) => <li key={l.id}>{l.lesson}</li>)}</ul>
        </section>
      )}
      <section>
        <div className="sec-head"><h2>Fluxograma</h2></div>
        {flows.length ? (
          flows.map((f) => (
            <div key={f.id}>
              <div className="muted small">{f.title} · <Link href={`/fluxo?id=${f.id}`}>editar</Link></div>
              <FlowView root={f.root} combos={d.combos} videos={d.videos} />
            </div>
          ))
        ) : (
          <div className="empty">
            Nenhum fluxograma para {name}.
            <div className="row">
              <ActionButton className="primary" action={createMatchupFlow.bind(null, name)}>Criar a partir do modelo</ActionButton>
            </div>
          </div>
        )}
      </section>
      {vids.length > 0 && (
        <section>
          <h3 style={{ marginBottom: 6 }}>Vídeos deste matchup</h3>
          <ul className="plain">
            {vids.map((v) => (
              <li key={v.id}>
                <a href={v.url} target="_blank" rel="noopener noreferrer">{v.title || "abrir"}</a>
                {v.ts && <span className="mono small muted"> {v.ts}</span>}
                {v.note && <span className="small muted"> · {v.note}</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
