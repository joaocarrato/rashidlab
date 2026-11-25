import type { Metadata } from "next";
import Link from "next/link";
import { getAll } from "@/lib/data";
import { SITS, STATUS } from "@/lib/constants";
import { cycleCombo, deleteCombo, saveCombo, seedCombos } from "@/app/actions";
import FormModal, { type Field } from "@/components/FormModal";
import { ActionButton, CopyButton } from "@/components/small";

export const metadata: Metadata = { title: "Combos" };
export const dynamic = "force-dynamic";

const FIELDS: Field[] = [
  { k: "title", l: "Nome", ph: "Ex.: BnB meio da tela" },
  { k: "sit", l: "Situação", t: "select", o: SITS },
  { k: "notation", l: "Sequência (notação numérica)", t: "textarea", ph: "Ex.: 2MP > 5HP xx ...", mono: true },
  { k: "dmg", l: "Dano", t: "number" },
  { k: "cost", l: "Custo (Drive / Super)", ph: "Ex.: 1 barra de Drive" },
  { k: "status", l: "Status", t: "select", o: STATUS.map((s, i): [string, string] => [String(i), s]) },
  { k: "video", l: "Link de vídeo (https)", t: "url" },
  { k: "notes", l: "Notas (timing, quando não funciona)", t: "textarea" },
];

function Chips({ items, k, cur, q }: { items: string[]; k: "sit" | "st"; cur: string; q: Record<string, string> }) {
  return (
    <div className="row" style={{ gap: 6 }}>
      {["Todos", ...items].map((i) => {
        const p = new URLSearchParams({ ...q, [k]: i });
        return <Link key={i} className={`chip ${cur === i ? "on" : ""}`} href={`/combos?${p}`}>{i}</Link>;
      })}
    </div>
  );
}

export default async function Combos({ searchParams }: { searchParams: Promise<{ sit?: string; st?: string }> }) {
  const sp = await searchParams;
  const sit = sp.sit && SITS.includes(sp.sit) ? sp.sit : "Todos";
  const st = sp.st && STATUS.includes(sp.st) ? sp.st : "Todos";
  const { combos } = await getAll();
  const list = combos
    .filter((c) => (sit === "Todos" || c.sit === sit) && (st === "Todos" || STATUS[c.status] === st))
    .sort((a, b) => SITS.indexOf(a.sit) - SITS.indexOf(b.sit) || a.title.localeCompare(b.title));
  const q = { sit, st };

  return (
    <>
      <div className="sec-head">
        <h2>Combos</h2><span className="spacer" />
        {!combos.length && <ActionButton action={seedCombos}>Carregar situações modelo</ActionButton>}
        <FormModal title="Novo combo" trigger="Novo combo" triggerClass="primary" fields={FIELDS}
          values={{ sit: SITS[0], status: "0" }} onSubmit={saveCombo.bind(null, null)} />
      </div>
      <div style={{ display: "grid", gap: 8, marginBottom: 18 }}>
        <Chips items={SITS} k="sit" cur={sit} q={q} />
        <Chips items={STATUS} k="st" cur={st} q={q} />
      </div>
      {!combos.length ? (
        <div className="empty">
          Organize por situação (anti-aéreo, punição, canto…) e não por personagem.<br />
          As situações modelo vêm sem sequência: você preenche com o que o seu Rashid usa.
        </div>
      ) : list.length ? (
        <div className="grid">
          {list.map((c) => (
            <article className="panel" key={c.id}>
              <div className="row" style={{ gap: 8 }}>
                <span className="tag">{c.sit}</span><span className="spacer" />
                <ActionButton className={`pill s${c.status}`} action={cycleCombo.bind(null, c.id, c.status)}>{STATUS[c.status]}</ActionButton>
              </div>
              <h3 style={{ marginTop: 8 }}>{c.title}</h3>
              {c.notation ? (
                <><div className="notation mono">{c.notation}</div><CopyButton text={c.notation} /></>
              ) : (
                <div className="notation muted small">sequência a preencher</div>
              )}
              <div className="small muted">
                {c.dmg ? `Dano ${c.dmg}` : ""}{c.dmg && c.cost ? " · " : ""}{c.cost}
              </div>
              {c.notes && <div className="small" style={{ marginTop: 6 }}>{c.notes}</div>}
              <div className="row" style={{ marginTop: 8, gap: 4 }}>
                {c.video && <a href={c.video} target="_blank" rel="noopener noreferrer">Ver vídeo</a>}
                <span className="spacer" />
                <FormModal title="Editar combo" trigger="Editar" triggerClass="ghost" fields={FIELDS}
                  values={{ ...c, status: String(c.status) }}
                  onSubmit={saveCombo.bind(null, c.id)} onDelete={deleteCombo.bind(null, c.id)} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">Nada com esse filtro.</div>
      )}
    </>
  );
}
