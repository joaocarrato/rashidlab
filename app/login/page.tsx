"use client";

import { useActionState, useState } from "react";
import { signIn, signInPassword, type LoginState } from "./actions";

export default function LoginPage() {
  const [pw, pwAction, pwPending] = useActionState<LoginState, FormData>(signInPassword, {});
  const [link, linkAction, linkPending] = useActionState<LoginState, FormData>(signIn, {});
  const [showLink, setShowLink] = useState(false);

  return (
    <div className="wrap" style={{ maxWidth: 420, paddingTop: 72 }}>
      <h1 style={{ fontSize: 32 }}>
        Rashid <span style={{ color: "var(--accent)" }}>Lab</span>
      </h1>
      <p className="muted" style={{ margin: "8px 0 24px" }}>Entre com seu e-mail e senha.</p>

      <form action={pwAction} className="panel" style={{ display: "grid", gap: 14 }}>
        <div>
          <label htmlFor="email">E-mail</label>
          <input id="email" name="email" type="email" autoComplete="username" required />
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <input id="password" name="password" type="password" autoComplete="current-password" required />
        </div>
        <button className="primary" disabled={pwPending}>{pwPending ? "Entrando…" : "Entrar"}</button>
        {pw.error && <div className="loss" role="alert">{pw.error}</div>}
      </form>

      <div style={{ marginTop: 20 }}>
        {!showLink ? (
          <button type="button" className="ghost" onClick={() => setShowLink(true)}>
            Esqueci a senha ou ainda não tenho uma
          </button>
        ) : (
          <form action={linkAction} className="panel" style={{ display: "grid", gap: 14 }}>
            <p className="muted small" style={{ margin: 0 }}>
              Receba um link por e-mail. Depois de entrar, defina uma senha em Conta.
            </p>
            <div>
              <label htmlFor="email2">E-mail</label>
              <input id="email2" name="email" type="email" autoComplete="email" required />
            </div>
            <button disabled={linkPending}>{linkPending ? "Enviando…" : "Receber link de acesso"}</button>
            {link.message && <div className="win" role="status">{link.message}</div>}
            {link.error && <div className="loss" role="alert">{link.error}</div>}
          </form>
        )}
      </div>
    </div>
  );
}
