-- Drive Lab: cole este arquivo inteiro no SQL Editor do Supabase e execute (instalação nova).
-- Já tem o banco antigo do Rashid Lab? Rode migrations/2026-11-25_1_multi_personagem.sql em vez deste.
-- Todas as tabelas pertencem a quem está logado (user_id) e só essa pessoa lê ou escreve.
-- "main" é o personagem que você está jogando; cada um tem seus próprios dados.

create table if not exists public.mains (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  char text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, char)
);

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main text not null,
  opp text not null,
  result text not null check (result in ('W','L')),
  tags text[] not null default '{}',
  lesson text not null default '',
  code text not null default '',
  played_on date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.combos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main text not null,
  title text not null,
  sit text not null default 'Neutro/abertura',
  notation text not null default '',
  dmg integer,
  cost text not null default '',
  status integer not null default 0 check (status between 0 and 2),
  video text not null default '',
  notes text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.matchups (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main text not null,
  char text not null,
  plan text not null default '',
  avoid text not null default '',
  tools text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, main, char)
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main text not null,
  url text not null default '',
  title text not null default '',
  tag text not null default 'Aula',
  char text not null default '',
  ts text not null default '',
  note text not null default '',
  seen boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.flows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main text not null,
  title text not null default 'Novo fluxograma',
  char text not null default '',
  root jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  main text not null,
  text text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, main)
);

create index if not exists logs_user_main_played on public.logs (user_id, main, played_on desc, created_at desc);
create index if not exists combos_user_main on public.combos (user_id, main);
create index if not exists videos_user_main on public.videos (user_id, main, created_at desc);
create index if not exists flows_user_main on public.flows (user_id, main);

do $$
declare t text;
begin
  foreach t in array array['mains','logs','combos','matchups','videos','flows','focus'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t);
  end loop;
end $$;
