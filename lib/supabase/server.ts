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

/** Cliente + usuário logado; lança erro se não houver sessão. */
export async function requireUser() {
  const sb = await createClient();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) throw new Error("Sessão expirada. Entre de novo.");
  return { sb, user: data.user };
}
