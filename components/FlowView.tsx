import type { Combo, FlowNode, Video } from "@/lib/types";
import Notation from "./Notation";

export const NODE_LABEL = { s: "Situação", d: "Decisão", a: "Ação" } as const;

export function LinkChip({ node, combos, videos }: { node: FlowNode; combos: Combo[]; videos: Video[] }) {
  if (!node.lk) return null;
  const [kind, id] = node.lk.split(":");
  if (kind === "c") {
    const c = combos.find((x) => x.id === id);
    if (!c) return null;
    return (
      <div className="lk">
        <span className="tag">Combo</span> {c.title}
        {c.notation && <Notation text={c.notation} />}
      </div>
    );
  }
  if (kind === "v") {
    const v = videos.find((x) => x.id === id);
    if (!v) return null;
    return (
      <div className="lk">
        <span className="tag">Vídeo</span>{" "}
        {/^https:\/\//i.test(v.url) ? <a href={v.url} target="_blank" rel="noopener noreferrer">{v.title || "abrir"}</a> : v.title}
        {v.ts && ` · ${v.ts}`}
      </div>
    );
  }
  return null;
}

function Node({ n, root, combos, videos }: { n: FlowNode; root?: boolean; combos: Combo[]; videos: Video[] }) {
  return (
    <li className={root ? "root" : ""}>
      <div className={`nd ${n.type}`}>
        <div className="ctl"><span className="ty">{NODE_LABEL[n.type]}</span></div>
        <div className="txt">{n.t}</div>
        <LinkChip node={n} combos={combos} videos={videos} />
      </div>
      {n.kids.length > 0 && (
        <ul>{n.kids.map((k) => <Node key={k.id} n={k} combos={combos} videos={videos} />)}</ul>
      )}
    </li>
  );
}

/** Árvore somente leitura (usada em "Antes da luta" e no modo leitura). */
export default function FlowView({ root, combos, videos }: { root: FlowNode; combos: Combo[]; videos: Video[] }) {
  return (
    <div className="flowbox">
      <ul className="tl"><Node n={root} root combos={combos} videos={videos} /></ul>
    </div>
  );
}
