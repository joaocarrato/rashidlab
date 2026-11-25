"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { saveLog } from "@/app/actions";
import { ROSTER, TAGS } from "@/lib/constants";
import FormModal from "./FormModal";
import { localDate } from "@/lib/date";

export default function QuickLog({ defaultOpp }: { defaultOpp: string }) {
  const [opp, setOpp] = useState(defaultOpp);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState("");

  function win() {
    // Mostra a confirmação na hora; se o servidor recusar, a mensagem vira o erro.
    setMsg(`Vitória registrada contra ${opp}`);
    start(async () => {
      try { await saveLog(null, { opp, result: "W", tags: [], date: localDate() }); }
      catch (e) { setMsg(e instanceof Error ? e.message : "Não salvou"); }
    });
  }

  return (
    <section className="panel">
      <div className="sec-head"><h3>Registrar partida</h3></div>
      <label htmlFor="qopp">Contra quem</label>
      <select id="qopp" value={opp} onChange={(e) => { setOpp(e.target.value); setMsg(""); }}>
        {ROSTER.map((r) => <option key={r}>{r}</option>)}
      </select>
      <div className="row" style={{ marginTop: 12, flexWrap: "nowrap" }}>
        <button className="primary" style={{ flex: 1 }} onClick={win} disabled={pending}>Venci</button>
        <FormModal
          title={`Derrota para ${opp}: o que custou?`} trigger="Perdi" triggerClass="" saveLabel="Registrar"
          hidden={{ opp, result: "L", date: localDate() }}
          fields={[
            { k: "tags", l: "O que mais te custou (marque 0 a 2)", t: "tags", o: TAGS },
            { k: "lesson", l: "Uma lição em uma frase", ph: "Ex.: parei de apertar botão depois do block" },
          ]}
          onSubmit={(v) => saveLog(null, v)}
        />
      </div>
      <div className="small" role="status" style={{ minHeight: 20, marginTop: 8, color: "var(--win)" }}>{msg}</div>
      <div className="row" style={{ marginTop: 4, gap: 4 }}>
        <Link className="btn ghost" href={`/antes?opp=${encodeURIComponent(opp)}`}>Ver antes da partida</Link>
      </div>
    </section>
  );
}
