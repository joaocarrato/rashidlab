"use client";

import { useActionState } from "react";
import { setPassword, type PasswordState } from "./actions";

export default function ContaPage() {
  const [state, action, pending] = useActionState<PasswordState, FormData>(setPassword, {});
  return (
    <>
      <div className="sec-head"><h2>Conta</h2></div>
      <form action={action} className="panel" style={{ display: "grid", gap: 14, maxWidth: 420 }}>
        <h3>Definir ou trocar a senha</h3>
        <p className="muted small" style={{ margin: 0 }}>
          Com senha você não precisa receber link por e-mail a cada acesso. Use pelo menos 8 caracteres.
        </p>
        <div>
          <label htmlFor="password">Nova senha</label>
          <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <div>
          <label htmlFor="confirm">Repita a senha</label>
          <input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
        </div>
        <button className="primary" disabled={pending}>{pending ? "Salvando…" : "Salvar senha"}</button>
        {state.message && <div className="win" role="status">{state.message}</div>}
        {state.error && <div className="loss" role="alert">{state.error}</div>}
      </form>
    </>
  );
}
