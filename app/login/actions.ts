"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface LoginState {
  message?: string;
  error?: string;
}

export async function signIn(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Digite um e-mail válido." };

  // Uso pessoal: se ALLOWED_EMAIL estiver definido, só esse e-mail recebe link.
  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
  if (allowed && email !== allowed) return { error: "Este e-mail não tem acesso." };

  const h = await headers();
  const origin =
    process.env.NEXT_PUBLIC_SITE_URL || h.get("origin") || `https://${h.get("host") ?? "localhost:3000"}`;

  const sb = await createClient();
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback`, shouldCreateUser: true },
  });
  if (error) return { error: "Não consegui enviar o link. Tente de novo em instantes." };
  return { message: "Link enviado. Abra o e-mail neste mesmo navegador." };
}

export async function signInPassword(_prev: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !password) return { error: "Digite e-mail e senha." };

  const allowed = (process.env.ALLOWED_EMAIL ?? "").trim().toLowerCase();
  if (allowed && email !== allowed) return { error: "E-mail ou senha incorretos." };

  const sb = await createClient();
  const { error } = await sb.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail ou senha incorretos." };
  redirect("/");
}

export async function signOut() {
  const sb = await createClient();
  await sb.auth.signOut();
  redirect("/login");
}
