"use client";

import { useState, useTransition } from "react";
import { saveFocus } from "@/app/actions";

export default function FocusBox({ initial }: { initial: string }) {
  const [text, setText] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [, start] = useTransition();
  return (
    <section className="panel focus">
      <label htmlFor="focus">Foco da semana (uma coisa só)</label>
      <textarea
        id="focus" value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Ex.: parar de apertar botão depois do block. Só anti-aéreo consistente."
        onBlur={() => { if (text !== saved) { setSaved(text); start(() => saveFocus(text)); } }}
      />
    </section>
  );
}
