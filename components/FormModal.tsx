"use client";

import { useEffect, useState, useTransition } from "react";

export type Field = {
  k: string;
  l: string;
  t?: "text" | "url" | "number" | "date" | "textarea" | "select" | "tags";
  o?: (string | [string, string])[];
  ph?: string;
  mono?: boolean;
};

type Values = Record<string, unknown>;

export default function FormModal({
  title, fields, values = {}, onSubmit, onDelete, trigger, triggerClass = "", saveLabel = "Salvar", hidden = {},
}: {
  title: string;
  fields: Field[];
  values?: Values;
  onSubmit: (v: Values) => Promise<void>;
  onDelete?: () => Promise<void>;
  trigger: React.ReactNode;
  triggerClass?: string;
  saveLabel?: string;
  /** Valores fixos enviados junto (ex.: resultado da partida). */
  hidden?: Values;
}) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [sure, setSure] = useState(false);

  useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open]);

  const close = () => { setOpen(false); setError(""); setSure(false); };

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = e.currentTarget;
    const out: Values = { ...hidden };
    for (const fd of fields) {
      if (fd.t === "tags")
        out[fd.k] = [...f.querySelectorAll<HTMLInputElement>(`input[name="${fd.k}"]:checked`)].map((x) => x.value);
      else out[fd.k] = (f.elements.namedItem(fd.k) as HTMLInputElement).value.trim();
    }
    start(async () => {
      try { await onSubmit(out); close(); }
      catch (err) { setError(err instanceof Error ? err.message : "Não salvou"); }
    });
  }

  return (
    <>
      <button type="button" className={triggerClass} onClick={() => setOpen(true)}>{trigger}</button>
      {open && (
        <div className="ov" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <form className="box" onSubmit={submit} role="dialog" aria-modal="true" aria-label={title}>
            <div className="row">
              <h2 style={{ flex: 1 }}>{title}</h2>
              <button type="button" className="ghost" onClick={close}>Fechar</button>
            </div>
            {fields.map((f) => {
              const id = "f_" + f.k;
              const v = values[f.k];
              return (
                <div key={f.k}>
                  <label htmlFor={id}>{f.l}</label>
                  {f.t === "textarea" ? (
                    <textarea id={id} name={f.k} defaultValue={String(v ?? "")} placeholder={f.ph}
                      className={f.mono ? "mono" : ""} />
                  ) : f.t === "select" ? (
                    <select id={id} name={f.k} defaultValue={String(v ?? (Array.isArray(f.o?.[0]) ? f.o[0][0] : f.o?.[0] ?? ""))}>
                      {f.o?.map((o) => {
                        const [ov, ol] = Array.isArray(o) ? o : [o, o];
                        return <option key={ov} value={ov}>{ol}</option>;
                      })}
                    </select>
                  ) : f.t === "tags" ? (
                    <div className="checks">
                      {f.o?.map((o) => {
                        const ov = Array.isArray(o) ? o[0] : o;
                        return (
                          <label key={ov}>
                            <input type="checkbox" name={f.k} value={ov}
                              defaultChecked={Array.isArray(v) && v.includes(ov)} />
                            {ov}
                          </label>
                        );
                      })}
                    </div>
                  ) : (
                    <input id={id} name={f.k} type={f.t ?? "text"} defaultValue={String(v ?? "")} placeholder={f.ph}
                      className={f.mono ? "mono" : ""} />
                  )}
                </div>
              );
            })}
            {error && <div className="loss" role="alert">{error}</div>}
            <div className="row">
              <button className="primary" disabled={pending}>{pending ? "Salvando…" : saveLabel}</button>
              {onDelete && (
                <button type="button" className="danger" disabled={pending}
                  onClick={() => (sure ? start(async () => { await onDelete(); close(); }) : setSure(true))}>
                  {sure ? "Clique de novo para apagar" : "Apagar"}
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
}
