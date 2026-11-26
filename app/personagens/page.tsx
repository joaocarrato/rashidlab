import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { getContext } from "@/lib/main";
import { ROSTER, charColor } from "@/lib/constants";
import { pickMain, removeMain } from "@/app/actions";
import { ActionButton } from "@/components/small";

export const metadata: Metadata = { title: "Personagens" };
export const dynamic = "force-dynamic";

function count(rows: { main: string }[] | null) {
  const m: Record<string, number> = {};
  (rows ?? []).forEach((r) => (m[r.main] = (m[r.main] || 0) + 1));
  return m;
}

export default async function Personagens() {
  const { sb, mains, main } = await getContext();
  const [logs, combos] = await Promise.all([
    sb.from("logs").select("main").limit(5000),
    sb.from("combos").select("main").limit(2000),
  ]);
  const nLogs = count(logs.data as { main: string }[] | null);
  const nCombos = count(combos.data as { main: string }[] | null);
  const rest = ROSTER.filter((c) => !mains.includes(c));

  return (
    <>
      <div className="sec-head">
        <h2>Seleção de personagens</h2>
        <span className="muted small">cada personagem tem seus próprios combos, matchups, partidas e fluxogramas</span>
      </div>

      {mains.length > 0 ? (
        <section>
          <h3 className="kicker">Seus personagens</h3>
          <div className="cs-grid mine">
            {mains.map((c) => (
              <div key={c} className={`cs ${c === main ? "on" : ""}`} style={{ "--c": charColor(c) } as CSSProperties}>
                <form action={pickMain.bind(null, c, true)}>
                  <button className="cs-pick" aria-label={`Jogar de ${c}`}>
                    {c === main && <span className="cs-flag">Jogando</span>}
                    <span className="cs-name">{c}</span>
                    <span className="cs-meta">{nCombos[c] ?? 0} combos · {nLogs[c] ?? 0} partidas</span>
                  </button>
                </form>
                <ActionButton className="ghost cs-x" confirm action={removeMain.bind(null, c)}>Tirar</ActionButton>
              </div>
            ))}
          </div>
          <p className="muted small" style={{ marginTop: 10 }}>
            Tirar um personagem só esconde da lista: as anotações ficam guardadas e voltam se você escolher ele de novo.
          </p>
        </section>
      ) : (
        <div className="tip" style={{ marginBottom: 24 }}>
          <b>Escolha com quem você joga.</b> Dá para ter vários; o site separa tudo por personagem e você troca no topo da página.
        </div>
      )}

      <section>
        <h3 className="kicker">{mains.length ? "Adicionar personagem" : "Personagens"}</h3>
        <div className="cs-grid">
          {rest.map((c) => (
            <form key={c} action={pickMain.bind(null, c, true)} className="cs" style={{ "--c": charColor(c) } as CSSProperties}>
              <button className="cs-pick" aria-label={`Adicionar ${c}`}>
                <span className="cs-name">{c}</span>
              </button>
            </form>
          ))}
        </div>
      </section>
    </>
  );
}
