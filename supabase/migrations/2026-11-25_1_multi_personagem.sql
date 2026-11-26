-- Drive Lab: separa todos os dados por personagem que você joga (coluna "main").
-- Cole no SQL Editor do Supabase e execute UMA vez, antes de publicar a nova versão do site.
-- Tudo o que já existe vira dados do Rashid. Nada é apagado.

begin;

-- 1) Lista dos personagens que você joga
create table if not exists public.mains (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  char text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, char)
);
alter table public.mains enable row level security;
drop policy if exists "own rows" on public.mains;
create policy "own rows" on public.mains for all to authenticated
  using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

-- 2) Coluna "main" em todas as tabelas; o que já existe fica com o Rashid
alter table public.logs     add column if not exists main text not null default 'Rashid';
alter table public.combos   add column if not exists main text not null default 'Rashid';
alter table public.matchups add column if not exists main text not null default 'Rashid';
alter table public.videos   add column if not exists main text not null default 'Rashid';
alter table public.flows    add column if not exists main text not null default 'Rashid';
alter table public.focus    add column if not exists main text not null default 'Rashid';

-- 3) "Rashid (espelho)" vira só "Rashid" (o espelho agora depende de quem você está jogando)
update public.logs     set opp  = 'Rashid' where opp  = 'Rashid (espelho)';
update public.matchups set char = 'Rashid' where char = 'Rashid (espelho)';
update public.videos   set char = 'Rashid' where char = 'Rashid (espelho)';
update public.flows    set char = 'Rashid' where char = 'Rashid (espelho)';

-- 4) Matchup e foco passam a ser por personagem
alter table public.matchups drop constraint if exists matchups_pkey;
alter table public.matchups add primary key (user_id, main, char);
alter table public.focus drop constraint if exists focus_pkey;
alter table public.focus add primary key (user_id, main);

-- 5) Daqui em diante o site sempre informa o personagem
alter table public.logs     alter column main drop default;
alter table public.combos   alter column main drop default;
alter table public.matchups alter column main drop default;
alter table public.videos   alter column main drop default;
alter table public.flows    alter column main drop default;
alter table public.focus    alter column main drop default;

-- 6) Quem já tem dados ganha o Rashid na lista de personagens
insert into public.mains (user_id, char)
select distinct user_id, 'Rashid' from (
  select user_id from public.logs
  union select user_id from public.combos
  union select user_id from public.matchups
  union select user_id from public.videos
  union select user_id from public.flows
  union select user_id from public.focus
) u
on conflict do nothing;

-- 7) Índices por personagem
drop index if exists public.logs_user_played;
drop index if exists public.combos_user;
drop index if exists public.videos_user;
drop index if exists public.flows_user;
create index if not exists logs_user_main_played on public.logs (user_id, main, played_on desc, created_at desc);
create index if not exists combos_user_main on public.combos (user_id, main);
create index if not exists videos_user_main on public.videos (user_id, main, created_at desc);
create index if not exists flows_user_main on public.flows (user_id, main);

commit;
