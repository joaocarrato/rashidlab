"use client";

import { useState, useSyncExternalStore, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ROSTER } from "@/lib/constants";
import { localDate } from "@/lib/date";

/** Botão que roda uma Server Action. `confirm` pede um segundo clique. */
export function ActionButton({
  action, className = "", children, confirm = false,
}: {
  action: () => Promise<void>;
  className?: string;
  children: React.ReactNode;
  confirm?: boolean;
}) {
  const [pending, start] = useTransition();
  const [sure, setSure] = useState(false);
  return (
    <button
      type="button" className={className} disabled={pending}
      onClick={() => (confirm && !sure ? setSure(true) : start(async () => { await action(); setSure(false); }))}
    >
      {confirm && sure ? "Confirmar" : children}
    </button>
  );
}

export function CopyButton({ text, label = "Copiar", className = "ghost" }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button" className={className}
      onClick={() => navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 1500); }, () => {})}
    >
      {done ? "Copiado" : label}
    </button>
  );
}


/** Últimos 14 dias com registro, calculados no fuso do navegador. */
export function ActivityDots({ dates }: { dates: string[] }) {
  // "" no servidor; a data local do navegador depois da hidratação.
  const today = useSyncExternalStore(() => () => {}, () => localDate(), () => "");
  const days: string[] = [];
  if (today) {
    for (let i = 13; i >= 0; i--) { const d = new Date(today + "T12:00:00"); d.setDate(d.getDate() - i); days.push(localDate(d)); }
  }
  const played = new Set(dates);
  const n = days.filter((d) => played.has(d)).length;
  return (
    <>
      <div className="row" style={{ gap: 24 }}>
        <div><div className="stat">{n}<span className="muted" style={{ fontSize: 16 }}>/14</span></div>
          <div className="small muted">dias com registro</div></div>
      </div>
      <div className="dots" style={{ marginTop: 12 }} aria-label="Últimos 14 dias">
        {(days.length ? days : Array(14).fill("")).map((d, i) => <i key={i} className={played.has(d) ? "on" : ""} title={d} />)}
      </div>
    </>
  );
}

export function OppSelect({ value }: { value: string }) {
  const router = useRouter();
  return (
    <select id="pre" value={value} onChange={(e) => router.push(`/antes?opp=${encodeURIComponent(e.target.value)}`)}>
      {ROSTER.map((r) => <option key={r}>{r}</option>)}
    </select>
  );
}
