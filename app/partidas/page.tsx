import type { Metadata } from "next";
import { getAll } from "@/lib/data";
import { ROSTER, TAGS } from "@/lib/constants";
import { deleteLog, saveLog } from "@/app/actions";
import FormModal, { type Field } from "@/components/FormModal";
import { CopyButton } from "@/components/small";

export const metadata: Metadata = { title: "Partidas" };
export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { k: "opp", l: "Oponente", t: "select", o: [...ROSTER] },
  { k: "result", l: "Resultado", t: "select", o: [["W", "Vitória"], ["L", "Derrota"]] },
  { k: "tags", l: "O que mais te custou (marque 0 a 2)", t: "tags", o: TAGS },
  { k: "lesson", l: "Uma lição em uma frase" },
  { k: "code", l: "Código do replay (opcional)", ph: "ex.: ABC123DEF" },
  { k: "date", l: "Data", t: "date" },
];

export default async function Partidas() {
  const { logs } = await getAll();
  return (
    <>
      <div className="sec-head">
        <h2>Partidas</h2><span className="spacer" />
        <FormModal title="Registrar partida" triggerClass="primary" trigger="Registrar partida" saveLabel="Registrar"
          fields={FIELDS} values={{ result: "L" }} onSubmit={saveLog.bind(null, null)} />
      </div>
      {logs.length ? (
        <div className="tbl">
          <table>
            <thead><tr><th>Data</th><th>Oponente</th><th></th><th>Erros e lição</th><th>Replay</th><th></th></tr></thead>
            <tbody>
              {logs.slice(0, 100).map((l) => (
                <tr key={l.id}>
                  <td className="small">{l.played_on.split("-").reverse().join("/")}</td>
                  <td>{l.opp}</td>
                  <td><b className={l.result === "W" ? "win" : "loss"}>{l.result === "W" ? "V" : "D"}</b></td>
                  <td>
                    <div className="tags">{l.tags.map((t) => <span className="tag" key={t}>{t}</span>)}</div>
                    {l.lesson && <div className="small" style={{ marginTop: 4 }}>{l.lesson}</div>}
                  </td>
                  <td className="mono small">{l.code && <CopyButton text={l.code} label={l.code} />}</td>
                  <td>
                    <FormModal title="Editar partida" triggerClass="ghost" trigger="Editar" fields={FIELDS}
                      values={{ ...l, date: l.played_on }} onSubmit={saveLog.bind(null, l.id)} onDelete={deleteLog.bind(null, l.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty">Nenhuma partida ainda. Depois de cada derrota: oponente, o que custou, uma frase. Só isso.</div>
      )}
    </>
  );
}
