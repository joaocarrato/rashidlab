/** Nome do site: troque aqui e vale para cabeçalho, login, título da aba e manifesto. */
export const APP = { name: "Drive Lab", a: "Drive", b: "Lab", tagline: "Caderno de treino de Street Fighter 6" } as const;

export const ROSTER = [
  "Ryu", "Luke", "Jamie", "Chun-Li", "Guile", "Kimberly", "Juri", "Ken", "Blanka", "Dhalsim",
  "E. Honda", "Dee Jay", "Manon", "Marisa", "J.P.", "Zangief", "Lily", "Cammy", "Rashid", "A.K.I.",
  "Ed", "Akuma", "M. Bison", "Terry", "Mai", "Elena", "Sagat", "C. Viper", "Alex", "Ingrid",
] as const;

/** Cor de cada personagem: vira a cor de destaque do site quando você joga com ele. */
export const CHAR_COLOR: Record<string, string> = {
  "Ryu": "#F1E6D2", "Luke": "#4FA8FF", "Jamie": "#F5C24C", "Chun-Li": "#5B9BFF", "Guile": "#A8C96B",
  "Kimberly": "#FF8A3D", "Juri": "#D07BFF", "Ken": "#FF5446", "Blanka": "#7BDB57", "Dhalsim": "#FFB347",
  "E. Honda": "#6FA0FF", "Dee Jay": "#D9FF3A", "Manon": "#F0A6CF", "Marisa": "#FF7A52", "J.P.": "#B79CFF",
  "Zangief": "#FF4D4D", "Lily": "#7ED8EC", "Cammy": "#5EDC8A", "Rashid": "#35E0C8", "A.K.I.": "#B86CFF",
  "Ed": "#5FC8FF", "Akuma": "#FF3B47", "M. Bison": "#C455FF", "Terry": "#FF6060", "Mai": "#FF4F86",
  "Elena": "#F3D46B", "Sagat": "#FFA933", "C. Viper": "#3FE0C5", "Alex": "#5BE37D", "Ingrid": "#FF9AD5",
};
export const DEFAULT_ACCENT = "#FF2E6E";
export const charColor = (c: string | null | undefined) => (c && CHAR_COLOR[c]) || DEFAULT_ACCENT;

export const TAGS = [
  "Anti-aéreo", "Punição errada", "Drive mal gasto", "Sem plano no okizeme",
  "Impaciência no neutro", "Defesa/wake-up", "Execução de combo", "Matchup desconhecido",
  "Tilt/desatenção", "Drive Impact/Parry",
];

export const SITS = [
  "Neutro/abertura", "Anti-aéreo", "Punição", "Punish Counter", "Drive Rush", "Drive Impact", "Canto",
  "Super Art", "Pós-parry", "Okizeme", "Setup de recurso",
];

export const STATUS = ["Aprender", "Treinando", "Confiável"];
export const VTAGS = ["Aula", "Pro play", "Meu replay", "Matchup", "Combo"];

export const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export const charFromSlug = (s: string) => ROSTER.find((r) => slug(r) === s);

export const isChar = (s: string) => (ROSTER as readonly string[]).includes(s);

/** Nomes antigos que mudaram (o "espelho" agora é só o personagem). */
export const normChar = (s: string) => (s === "Rashid (espelho)" ? "Rashid" : s);
