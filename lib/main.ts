import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { hasSupabase } from "@/lib/supabase/env";
import { charFromSlug, isChar, slug } from "@/lib/constants";

/** Cookie com o slug do personagem ativo (ex.: "dee-jay"). */
export const MAIN_COOKIE = "main";
export const mainCookieValue = (char: string) => slug(char);

/**
 * Sessão + lista de personagens que você joga + o personagem ativo.
 * `cache` faz layout, página e Server Action da mesma requisição dividirem uma consulta só.
 */
export const getContext = cache(async () => {
  const sb = await createClient();
  const { data } = await sb.auth.getClaims();
  const userId = data?.claims?.sub ?? null;
  if (!userId) return { sb, userId: null, mains: [] as string[], main: null };
  const r = await sb.from("mains").select("char").order("created_at");
  if (r.error) throw new Error(r.error.message);
  const mains = (r.data as { char: string }[]).map((x) => x.char).filter(isChar);
  const want = charFromSlug((await cookies()).get(MAIN_COOKIE)?.value ?? "");
  const main = want && mains.includes(want) ? want : mains[0] ?? null;
  return { sb, userId, mains, main };
});

/** Para o layout: nunca quebra a página (sem chaves, sem sessão ou banco antigo). */
export async function getShell(): Promise<{ main: string | null; mains: string[] }> {
  if (!hasSupabase) return { main: null, mains: [] };
  try {
    const { main, mains } = await getContext();
    return { main, mains };
  } catch {
    return { main: null, mains: [] };
  }
}

/** Usuário logado + personagem ativo. Sem personagem, manda para a seleção. */
export async function requireMain() {
  const { sb, userId, main } = await getContext();
  if (!userId) throw new Error("Sessão expirada. Entre de novo.");
  if (!main) redirect("/personagens");
  return { sb, user: { id: userId }, main };
}
