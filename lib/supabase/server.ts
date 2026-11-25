import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SUPABASE_KEY, SUPABASE_URL } from "./env";

export async function createClient() {
  const store = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return store.getAll();
      },
      setAll(list) {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, options));
        } catch {
          // Chamado de um Server Component: o proxy já renova a sessão.
        }
      },
    },
  });
}

/**
 * Cliente + usuário logado; lança erro se não houver sessão.
 * getClaims valida o JWT localmente (chaves assimétricas do Supabase), sem ir ao
 * servidor de Auth a cada chamada como o getUser fazia.
 */
export async function requireUser() {
  const sb = await createClient();
  const { data, error } = await sb.auth.getClaims();
  const id = data?.claims?.sub;
  if (error || !id) throw new Error("Sessão expirada. Entre de novo.");
  return { sb, user: { id } };
}
