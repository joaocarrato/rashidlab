import Link from "next/link";
import { getAll } from "@/lib/data";
import { computeStats, nextStep } from "@/lib/stats";
import { ROSTER } from "@/lib/constants";
import FocusBox from "@/components/FocusBox";
import QuickLog from "@/components/QuickLog";
import { ActivityDots } from "@/components/small";

export const dynamic = "force-dynamic";

export default async function Hoje() {
  const d = await getAll();
  const { sorted, last, wins, topTags } = computeStats(d.logs);
  const step = nextStep(d.logs, d.matchups);
  const maxT = topTags[0]?.[1] ?? 1;
  const conf = d.combos.filter((c) => c.status === 2).length;
  const defaultOpp = sorted[0]?.opp ?? ROSTER[0];
  const rate = last.length ? Math.round((wins / last.length) * 100) : null;

  return (
    <>
      <FocusBox initial={d.focus} />
      <div className="cols" style={{ marginTop: 28 }}>
        <div>
          <section>
            <div className="sec-head"><h2>Próximo passo</h2></div>
            <div className="tip">
              {step.before}<b>{step.bold}</b>{step.after}
              {step.href && <> <Link href={step.href}>Abrir</Link></>}
            </div>
          </section>
          <section>
            <div className="sec-head"><h2>Rotina mínima</h2><span className="muted small">30 min, 4 dias por semana vale mais que 3h uma vez</span></div>
            <ul className="plain">
              <li><b>10 min</b> no treino: 1 combo da lista “Treinando”, 20 acertos seguidos.</li>
              <li><b>15 min</b> de ranked ou casual, registrando cada derrota.</li>
              <li><b>5 min</b> revendo 1 replay de derrota: só procure o ponto onde perdeu a vida, não o replay inteiro.</li>
            </ul>
          </section>
          <section>
            <div className="sec-head"><h2>Onde você mais erra</h2><span className="muted small">últimas 40 partidas</span></div>
            {topTags.length ? (
              <div className="bars">
                {topTags.map(([t, n]) => (
                  <div className="r" key={t}>
                    <span>{t}</span><b>{n}</b>
                    <div className="bar"><i style={{ width: `${(n / maxT) * 100}%` }} /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty">Marque o que te custou em cada derrota e o padrão aparece aqui.</div>
            )}
          </section>
        </div>
        <div>
          <QuickLog defaultOpp={defaultOpp} />
          <section className="panel" style={{ marginTop: 16 }}>
            <div className="sec-head"><h3>Últimas 20 partidas</h3></div>
            <div className="stat" style={{ color: rate !== null && rate >= 50 ? "var(--win)" : "var(--loss)" }}>
              {rate !== null ? `${rate}%` : "–"}
            </div>
            <div className="small muted" style={{ marginBottom: 14 }}>{wins}V · {last.length - wins}D</div>
            <ActivityDots dates={d.logs.map((l) => l.played_on)} />
          </section>
          <section className="panel">
            <div className="sec-head"><h3>Combos confiáveis</h3></div>
            <div className="stat">{conf}<span className="muted" style={{ fontSize: 16 }}>/{d.combos.length}</span></div>
            <div className="bar" style={{ marginTop: 10 }}>
              <i style={{ width: `${d.combos.length ? (conf / d.combos.length) * 100 : 0}%` }} />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
