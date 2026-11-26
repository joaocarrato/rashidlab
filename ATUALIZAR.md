# Como atualizar o site (Supabase + Vercel)

A ordem importa: **primeiro o banco, depois o site**. O site novo procura a tabela `mains` e a
coluna `main`; se ele subir antes da migration, as telas quebram até o banco ser atualizado.
Faça os passos 2 e 3 em seguida, sem intervalo longo entre eles.

## 1. Backup (1 minuto)

No site que está no ar hoje, abra **Backup** e baixe o arquivo JSON. Guarde. Nada é apagado
pelas migrations, mas é bom ter.

## 2. Banco (Supabase)

1. Entre em supabase.com, abra o projeto e vá em **SQL Editor > New query**.
2. Abra `supabase/migrations/2026-11-25_1_multi_personagem.sql`, copie tudo, cole e clique **Run**.
   - Rode **uma vez só**. Ela separa os dados por personagem e marca tudo o que já existe como Rashid.
   - Deve aparecer "Success. No rows returned".
3. Nova query com `supabase/migrations/2026-11-25_2_kimberly_combos.sql`, cole e **Run**.
   - Coloca a Kimberly na sua lista, com 49 combos e 5 fluxogramas.
   - Pode rodar de novo sem duplicar. Se você apagar um combo e rodar de novo, ele volta.

Conferir (opcional), numa nova query:

```sql
select main, count(*) from public.combos group by main;
select main, title from public.flows order by main, created_at;
```

## 3. Site (Vercel)

O código novo está só no seu computador. Para subir:

```powershell
git add -A
```

```powershell
git commit -m "Varios personagens; combos e oki da Kimberly"
```

```powershell
git push origin main
```

Se o projeto na Vercel está ligado ao GitHub (o normal), o push já dispara o deploy. Acompanhe em
vercel.com > seu projeto > **Deployments** até ficar "Ready" (1 a 2 minutos).

Se não estiver ligado ao GitHub, publique direto pelo terminal:

```powershell
npx vercel --prod
```

As variáveis de ambiente (chaves do Supabase) não mudaram, não precisa mexer nelas.

## 4. Testar no ar

1. Abra o site e entre. Ele cai em **Personagens**: Rashid e Kimberly devem estar lá.
2. Clique na Kimberly, vá em **Combos**: filtros novos "Punish Counter" e "Setup de recurso".
3. Vá em **Fluxo**: 5 fluxogramas de oki/punição, com os combos ligados nos passos.

## Se der errado

- Tela de erro depois do deploy: quase sempre é a migration 1 que não rodou. Rode e recarregue.
- Erro "Rode antes a migration ..." na migration 2: rode a 1 primeiro.
- Para voltar o site para a versão anterior: Vercel > Deployments > deploy antigo > **Promote to Production**.
  (O banco continua compatível com os dados, mas o site antigo não sabe usar a coluna `main`;
  melhor corrigir e subir de novo.)
