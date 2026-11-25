"use client";

import { useOptimistic, useTransition } from "react";

/**
 * Pílula que troca de estado a cada clique e mostra o novo estado na hora
 * (atualização otimista), enquanto a Server Action grava no fundo.
 */
export default function CyclePill({
  labels, classes, value, onChange,
}: {
  labels: string[];
  classes: string[];
  value: number;
  onChange: (next: number) => Promise<void>;
}) {
  const [shown, setShown] = useOptimistic(value);
  const [, start] = useTransition();
  return (
    <button
      type="button"
      className={`pill ${classes[shown] ?? ""}`}
      title="Clique para mudar"
      onClick={() => {
        const next = (shown + 1) % labels.length;
        start(async () => {
          setShown(next);
          await onChange(next);
        });
      }}
    >
      {labels[shown]}
    </button>
  );
}
