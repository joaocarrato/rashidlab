"use server";

import { requireUser } from "@/lib/supabase/server";

export interface PasswordState {
  message?: string;
  error?: string;
}

export async function setPassword(_prev: PasswordState, form: FormData): Promise<PasswordState> {
  const password = String(form.get("password") ?? "");
  const confirm = String(form.get("confirm") ?? "");
  if (password.length < 8) return { error: "Use pelo menos 8 caracteres." };
  if (password !== confirm) return { error: "As duas senhas não são iguais." };

  const { sb } = await requireUser();
  const { error } = await sb.auth.updateUser({ password });
  if (error) return { error: "Não consegui salvar a senha. Tente outra." };
  return { message: "Senha definida. Da próxima vez, entre com e-mail e senha." };
}
