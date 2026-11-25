"use client";

import { useActionState } from "react";
import { signIn, type LoginState } from "./actions";

export default function LoginPage() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});
  return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 72 }}>
      <h1 style={{ fontSize: 32 }}>
        Rashid <span style={{ color: "var(--accent)" }}>Lab</span>
      </h1>
      <p className="muted" style={{ margin: "8px 0 24px" }}>
        Entre com seu e-mail. Você recebe um link, sem senha.
      </p>
      <form action={action} className="panel" style={{ display: "grid", gap: 14 }}>
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="email" required />
        </div>
        <button className="primary" disabled={pending}>
          {pending ? "Enviando…" : "Receber link de acesso"}
        </button>
        {state.message && <div className="win" role="status">{state.message}</div>}
        {state.error && <div className="loss" role="alert">{state.error}</div>}
      </form>
    </div>
  );
}
