import type { Metadata } from "next";
import Link from "next/link";
import { getData } from "@/lib/data";
import { createFlow, seedFlows } from "@/app/actions";
import FlowEditor from "@/components/FlowEditor";
import { ActionButton } from "@/components/small";

export const metadata: Metadata = { title: "Fluxograma" };
export const dynamic = "force-dynamic";

export default async function Fluxo({ searchParams }: { searchParams: Promise<{ id?: string; ro?: string }> }) {
  const { id, ro } = await searchParams;
  const { flows, combos, videos, main } = await getData(["flows", "combos", "videos"]);

  if (!flows.length) {
    return (
      <>
        <div className="sec-head"><h2>Fluxograma</h2><span className="muted small">de {main}</span></div>
        <div className="empty">
          Um fluxograma aqui é uma árvore: situação → decisão → ação. Serve para o que você faz quando o oponente faz X.
          <div className="row">
            <ActionButton className="primary" action={seedFlows}>Começar com dois modelos</ActionButton>
            <ActionButton action={createFlow}>Criar do zero</ActionButton>
          </div>
        </div>
      </>
    );
  }

  const cur = flows.find((f) => f.id === id) ?? flows[0];
  return (
    <>
      <div className="sec-head">
        <h2>Fluxograma</h2><span className="muted small">de {main}</span><span className="spacer" />
        <ActionButton action={createFlow}>Novo fluxograma</ActionButton>
      </div>
      <div className="row" style={{ gap: 6, marginBottom: 12 }}>
        {flows.map((f) => (
          <Link key={f.id} className={`chip ${f.id === cur.id ? "on" : ""}`} href={`/fluxo?id=${f.id}`}>
            {f.title}{f.char ? ` · ${f.char}` : ""}
          </Link>
        ))}
      </div>
      <FlowEditor key={cur.id} flow={cur} combos={combos} videos={videos} readOnly={ro === "1"} />
    </>
  );
}
