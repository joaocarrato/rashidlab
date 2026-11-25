export default function SetupPage() {
  return (
    <div className="wrap" style={{ maxWidth: 640, paddingTop: 48 }}>
      <h1 style={{ fontSize: 28 }}>Falta ligar o banco</h1>
      <p className="muted" style={{ margin: "8px 0 20px" }}>
        O site já está de pé, mas ainda não encontrou as chaves do Supabase.
      </p>
      <ol className="plain" style={{ lineHeight: 1.8 }}>
        <li>Crie um projeto em supabase.com.</li>
        <li>No SQL Editor, cole e execute o arquivo <code className="mono">supabase/schema.sql</code>.</li>
        <li>Em Project Settings, API, copie a URL e a chave pública (anon).</li>
        <li>
          Crie <code className="mono">.env.local</code> a partir de <code className="mono">.env.example</code> e
          reinicie o servidor.
        </li>
        <li>Em Authentication, URL Configuration, adicione <code className="mono">/auth/callback</code> do seu domínio.</li>
      </ol>
    </div>
  );
}
