import type { FlowNode, NodeType } from "./types";

export const newId = () =>
  Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

export const N = (t: string, type: NodeType, kids: FlowNode[] = []): FlowNode => ({
  id: newId(), t, type, lk: "", kids,
});

export const cloneN = (n: FlowNode): FlowNode => ({
  id: newId(), t: n.t, type: n.type, lk: n.lk || "", kids: n.kids.map(cloneN),
});

export function findNode(
  n: FlowNode, id: string, parent: FlowNode | null = null,
): { n: FlowNode; parent: FlowNode | null } | null {
  if (n.id === id) return { n, parent };
  for (const k of n.kids) {
    const r = findNode(k, id, n);
    if (r) return r;
  }
  return null;
}

/** Remove campos inesperados e limita tamanho antes de gravar no banco. */
export function sanitizeNode(n: unknown, depth = 0): FlowNode {
  const o = (n && typeof n === "object" ? n : {}) as Record<string, unknown>;
  const type = o.type === "d" || o.type === "a" ? o.type : "s";
  const kids = Array.isArray(o.kids) && depth < 12 ? o.kids.slice(0, 20) : [];
  return {
    id: typeof o.id === "string" && o.id ? o.id.slice(0, 40) : newId(),
    t: typeof o.t === "string" ? o.t.slice(0, 500) : "",
    type,
    lk: typeof o.lk === "string" ? o.lk.slice(0, 60) : "",
    kids: kids.map((k) => sanitizeNode(k, depth + 1)),
  };
}

export const SEED_FLOWS = () => [
  {
    title: "Neutro: plano geral",
    root: N("Neutro, ninguém com vantagem", "s", [
      N("Oponente pula ou aproxima de cima?", "d", [
        N("Anti-aéreo: [qual golpe] e confirmar [qual combo]", "a"),
        N("Sem anti-aéreo seguro: recuar e reposicionar", "a"),
      ]),
      N("Oponente fica parado e deixa vir?", "d", [
        N("Usar movimentação para criar distância e testar reação", "a"),
        N("Não encostar no Drive Gauge sem plano", "a"),
      ]),
      N("Oponente aperta botão pesado?", "d", [
        N("Punir com [seu melhor punish] e anotar o golpe", "a"),
      ]),
    ]),
  },
  {
    title: "Defesa e wake-up",
    root: N("Estou no chão ou sob pressão", "s", [
      N("Já conheço o ciclo do oponente?", "d", [
        N("Sim: escolher UMA opção por rodada e anotar o resultado", "a"),
        N("Não: só bloquear e observar 2 rodadas", "a"),
      ]),
      N("Drive Gauge disponível?", "d", [
        N("Sim: definir o que o Parry/Reversal resolve neste matchup", "a"),
        N("Não: priorizar bloquear e sair do canto", "a"),
      ]),
    ]),
  },
];

export const SEED_COMBOS: [string, string][] = [
  ["BnB meterless", "Neutro/abertura"],
  ["BnB com Drive Rush", "Drive Rush"],
  ["Confirmação de anti-aéreo", "Anti-aéreo"],
  ["Punição leve (início de combo)", "Punição"],
  ["Punição pesada (movimento recuperável)", "Punição"],
  ["Confirmação após Drive Impact (parede)", "Drive Impact"],
  ["Dano máximo no canto", "Canto"],
  ["Combo com Super Art 1", "Super Art"],
  ["Combo com Super Art 2", "Super Art"],
  ["Combo com Super Art 3", "Super Art"],
  ["Continuação após parry perfeito", "Pós-parry"],
  ["Knockdown + setup básico", "Okizeme"],
];
