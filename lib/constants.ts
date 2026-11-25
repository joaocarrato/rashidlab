export const ROSTER = [
  "Luke", "Jamie", "Manon", "Kimberly", "Marisa", "Lily", "J.P.", "Juri", "Ken", "Blanka",
  "Dhalsim", "E. Honda", "Dee Jay", "Cammy", "Chun-Li", "Guile", "Ryu", "Zangief", "A.K.I.",
  "Ed", "Akuma", "M. Bison", "Terry", "Mai", "Elena", "Sagat", "C. Viper", "Alex", "Ingrid",
  "Rashid (espelho)",
] as const;

export const TAGS = [
  "Anti-aéreo", "Punição errada", "Drive mal gasto", "Sem plano no okizeme",
  "Impaciência no neutro", "Defesa/wake-up", "Execução de combo", "Matchup desconhecido",
  "Tilt/desatenção", "Drive Impact/Parry",
];

export const SITS = [
  "Neutro/abertura", "Anti-aéreo", "Punição", "Drive Rush", "Drive Impact", "Canto",
  "Super Art", "Pós-parry", "Okizeme",
];

export const STATUS = ["Aprender", "Treinando", "Confiável"];
export const VTAGS = ["Aula", "Pro play", "Meu replay", "Matchup", "Combo"];

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const charFromSlug = (s: string) => ROSTER.find((r) => slug(r) === s);

export const isChar = (s: string) => (ROSTER as readonly string[]).includes(s);
