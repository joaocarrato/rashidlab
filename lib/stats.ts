import { slug } from "./constants";
import type { Log, Matchup } from "./types";

export function computeStats(logs: Log[]) {
  const sorted = [...logs].sort(
    (a, b) => b.played_on.localeCompare(a.played_on) || b.created_at.localeCompare(a.created_at),
  );
  const last = sorted.slice(0, 20);
  const wins = last.filter((l) => l.result === "W").length;
  const tagCount: Record<string, number> = {};
  sorted.slice(0, 40).forEach((l) => l.tags.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1)));
  const losses: Record<string, number> = {};
  sorted.filter((l) => l.result === "L").forEach((l) => (losses[l.opp] = (losses[l.opp] || 0) + 1));
  const topTags = Object.entries(tagCount).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topLoss = Object.entries(losses).sort((a, b) => b[1] - a[1])[0];
  return { sorted, last, wins, topTags, losses, topLoss };
}

export interface NextStep {
  before: string;
  bold: string;
  after: string;
  href?: string;
}

export function nextStep(logs: Log[], matchups: Matchup[]): NextStep {
  const { topLoss, topTags } = computeStats(logs);
  if (topLoss) {
    const mu = matchups.find((m) => slug(m.char) === slug(topLoss[0]));
    if (!mu || !mu.plan)
      return {
        before: `Você perdeu ${topLoss[1]}× para `, bold: topLoss[0],
        after: " e ainda não tem plano escrito. Abra o matchup e escreva 3 linhas.",
        href: `/matchups/${slug(topLoss[0])}`,
      };
    if (topTags[0])
      return {
        before: "Seu erro mais repetido é ", bold: topTags[0][0],
        after: ` (${topTags[0][1]}×). Escolha ele como foco da semana.`,
      };
  }
  return {
    before: "", bold: "Registre sua primeira partida.",
    after: " Leva 20 segundos e é isso que alimenta o resto do app.",
  };
}
