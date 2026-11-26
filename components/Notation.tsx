import { Fragment } from "react";

/**
 * Mostra a notação numérica como no jogo: 236HK vira ↓↘→ + botão HK.
 * O que não reconhecer (DR, xx, SA3, [4]6P…) aparece como texto, na mesma ordem.
 */
const DIR: Record<string, string> = { "1": "↙", "2": "↓", "3": "↘", "4": "←", "6": "→", "7": "↖", "8": "↑", "9": "↗" };
const MOVE = /^(j\.|cr\.|st\.|c\.|f\.)?([1-9]{0,8})(LP|MP|HP|LK|MK|HK|PP|KK|P|K)$/i;
const SEPS = /(\s+|>|,|~|->|\+)/;

function Key({ b }: { b: string }) {
  const s = b[0] === "L" ? "l" : b[0] === "M" ? "m" : b[0] === "H" ? "h" : b.length === 2 ? "x" : "";
  const kick = b.endsWith("K");
  return <span className={`key ${s} ${kick ? "kick" : ""}`}>{b}</span>;
}

function Token({ t }: { t: string }) {
  const m = MOVE.exec(t);
  if (!m) return <span className="word">{t}</span>;
  const [, pre, dirs, btn] = m;
  return (
    <span className="inp">
      {pre && <span className="pre">{pre.toLowerCase()}</span>}
      {[...dirs].filter((d) => d !== "5").map((d, i) => <span key={i} className="dir">{DIR[d]}</span>)}
      <Key b={btn.toUpperCase()} />
    </span>
  );
}

export default function Notation({ text }: { text: string }) {
  const parts = text.split(SEPS).filter((p) => p !== "");
  return (
    <div className="notation">
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {parts.map((p, i) => (
          <Fragment key={i}>
            {/^\s+$/.test(p) ? p : SEPS.test(p) ? <span className="sep">{p}</span> : <Token t={p} />}
          </Fragment>
        ))}
      </span>
    </div>
  );
}
