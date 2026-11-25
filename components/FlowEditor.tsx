"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { deleteFlow, duplicateFlow, saveFlow } from "@/app/actions";
import { ROSTER } from "@/lib/constants";
import { N, findNode } from "@/lib/flow";
import type { Combo, Flow, FlowNode, NodeType, Video } from "@/lib/types";
import { ActionButton } from "./small";
import { LinkChip, NODE_LABEL } from "./FlowView";

const ORDER: NodeType[] = ["s", "d", "a"];

export default function FlowEditor({
  flow, combos, videos, readOnly,
}: { flow: Flow; combos: Combo[]; videos: Video[]; readOnly: boolean }) {
  const [root, setRoot] = useState<FlowNode>(flow.root);
  const [title, setTitle] = useState(flow.title);
  const [char, setChar] = useState(flow.char);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");

  function persist(next: { root: FlowNode; title: string; char: string }) {
    start(async () => {
      try { await saveFlow(flow.id, next); setError(""); }
      catch (e) { setError(e instanceof Error ? e.message : "Não salvou"); }
    });
  }

  function mutate(fn: (r: FlowNode) => void) {
    const next = structuredClone(root);
    fn(next);
    setRoot(next);
    persist({ root: next, title, char });
  }

  const opts: [string, string][] = [
    ["", "Ligar a combo ou vídeo…"],
    ...combos.map((c): [string, string] => ["c:" + c.id, "Combo: " + c.title]),
    ...videos.map((v): [string, string] => ["v:" + v.id, "Vídeo: " + (v.title || v.url)]),
  ];

  function renderNode(n: FlowNode, isRoot: boolean): React.ReactNode {
    return (
      <li key={n.id} className={isRoot ? "root" : ""}>
        <div className={`nd ${n.type}`}>
          {readOnly ? (
            <>
              <div className="ctl"><span className="ty">{NODE_LABEL[n.type]}</span></div>
              <div className="txt">{n.t}</div>
            </>
          ) : (
            <>
              <div className="ctl">
                <button type="button" className="ghost ty" title="Trocar tipo"
                  onClick={() => mutate((r) => { const x = findNode(r, n.id)!.n; x.type = ORDER[(ORDER.indexOf(x.type) + 1) % 3]; })}>
                  {NODE_LABEL[n.type]}
                </button>
                <button type="button" className="ghost" title="Adicionar ramo" aria-label="Adicionar ramo"
                  onClick={() => mutate((r) => { const x = findNode(r, n.id)!.n; x.kids.push(N("Novo passo", x.type === "s" ? "d" : "a")); })}>+</button>
                {!isRoot && (
                  <button type="button" className="ghost danger" title="Apagar ramo" aria-label="Apagar ramo"
                    onClick={() => mutate((r) => { const f = findNode(r, n.id)!; if (f.parent) f.parent.kids = f.parent.kids.filter((k) => k.id !== n.id); })}>×</button>
                )}
              </div>
              <textarea
                rows={2} defaultValue={n.t} aria-label="Texto do nó"
                onBlur={(e) => { if (e.target.value !== n.t) mutate((r) => { findNode(r, n.id)!.n.t = e.target.value; }); }}
              />
              <select value={n.lk} aria-label="Ligar nó"
                onChange={(e) => mutate((r) => { findNode(r, n.id)!.n.lk = e.target.value; })}>
                {opts.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </>
          )}
          <LinkChip node={n} combos={combos} videos={videos} />
        </div>
        {n.kids.length > 0 && <ul>{n.kids.map((k) => renderNode(k, false))}</ul>}
      </li>
    );
  }

  return (
    <>
      <div className="row" style={{ marginBottom: 8, alignItems: "flex-end" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <label htmlFor="ftitle">Nome</label>
          <input id="ftitle" value={title} disabled={readOnly} onChange={(e) => setTitle(e.target.value)}
            onBlur={() => persist({ root, title, char })} />
        </div>
        <div style={{ width: 190 }}>
          <label htmlFor="fchar">Matchup</label>
          <select id="fchar" value={char} disabled={readOnly}
            onChange={(e) => { setChar(e.target.value); persist({ root, title, char: e.target.value }); }}>
            <option value="">Geral</option>
            {ROSTER.map((r) => <option key={r}>{r}</option>)}
          </select>
        </div>
        <Link className="btn" href={readOnly ? `/fluxo?id=${flow.id}` : `/fluxo?id=${flow.id}&ro=1`}>
          {readOnly ? "Editar" : "Modo leitura"}
        </Link>
        <ActionButton action={() => duplicateFlow(flow.id)}>Duplicar</ActionButton>
        <ActionButton className="danger" confirm action={() => deleteFlow(flow.id)}>Apagar</ActionButton>
      </div>
      {!readOnly && (
        <p className="muted small" style={{ margin: "0 0 4px" }}>
          Edite o texto direto no nó. “+” cria um ramo, o rótulo no topo troca entre Situação, Decisão e Ação, e o seletor liga
          o nó a um combo ou vídeo. Defina o Matchup para o fluxograma aparecer em “Antes da partida”.
          {pending ? " Salvando…" : ""}
        </p>
      )}
      {error && <div className="loss small" role="alert">{error}</div>}
      <div className="flowbox"><ul className="tl">{renderNode(root, true)}</ul></div>
    </>
  );
}
