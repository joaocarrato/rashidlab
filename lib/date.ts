const pad = (n: number) => String(n).padStart(2, "0");

/** Data local no formato YYYY-MM-DD (use no navegador para respeitar o fuso). */
export const localDate = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
