"use client";

import { useState, useTransition } from "react";
import { saveMatchup } from "@/app/actions";

const FIELDS = [
  { k: "plan", l: "Como eu ganho", ph: "3 linhas: o que fazer no neutro, no knockdown e quando estou na frente" },
  { k: "avoid", l: "O que me faz perder", ph: "Os 2 ou 3 golpes/situações que mais me pegam" },
  { k: "tools", l: "Respostas que preciso ter prontas", ph: "Anti-aéreo, punições, reação ao golpe X" },
  { k: "notes", l: "Notas livres", ph: "" },
] as const;

export default function MatchupForm({ char, initial }: { char: string; initial: Record<string, string> }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");
  return (
    <form
      className="panel" style={{ display: "grid", gap: 14 }}
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        const data = Object.fromEntries(FIELDS.map(({ k }) => [k, String(f.get(k) ?? "")]));
        start(async () => {
          try { await saveMatchup(char, data); setMsg("Salvo"); }
          catch (err) { setMsg(err instanceof Error ? err.message : "Não salvou"); }
        });
      }}
    >
      {FIELDS.map((f) => (
        <div key={f.k}>
          <label htmlFor={f.k}>{f.l}</label>
          <textarea id={f.k} name={f.k} defaultValue={initial[f.k]} placeholder={f.ph} rows={4} onChange={() => setMsg("")} />
        </div>
      ))}
      <div className="row">
        <button className="primary" disabled={pending}>{pending ? "Salvando…" : "Salvar"}</button>
        <span className="small" role="status" style={{ color: "var(--win)" }}>{msg}</span>
      </div>
    </form>
  );
}
