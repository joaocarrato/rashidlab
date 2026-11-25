"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function BackupPage() {
  const router = useRouter();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setBusy(true); setMsg("");
    try {
      const res = await fetch("/api/backup", { method: "POST", headers: { "Content-Type": "application/json" }, body: await file.text() });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Falhou");
      const c = j.counts as Record<string, number>;
      setMsg(`Importado: ${Object.entries(c).map(([k, v]) => `${v} ${k}`).join(", ")}.`);
      router.refresh();
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Falhou");
    } finally { setBusy(false); }
  }

  return (
    <>
      <div className="sec-head"><h2>Backup</h2></div>
      <div className="grid">
        <section className="panel">
          <h3 style={{ marginBottom: 6 }}>Exportar</h3>
          <p className="muted small">Baixa tudo em um arquivo JSON. Guarde de vez em quando.</p>
          <a className="btn primary" href="/api/backup">Baixar backup</a>
        </section>
        <section className="panel">
          <h3 style={{ marginBottom: 6 }}>Importar</h3>
          <p className="muted small">
            Aceita o backup do Rashid Lab antigo (artifact) e os arquivos exportados aqui. Importar adiciona os dados;
            não apaga o que já existe, então importar duas vezes duplica.
          </p>
          <input type="file" accept="application/json,.json" onChange={onFile} disabled={busy} aria-label="Arquivo de backup" />
          <div className="small" role="status" style={{ marginTop: 8 }}>{busy ? "Importando…" : msg}</div>
        </section>
      </div>
    </>
  );
}
