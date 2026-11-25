-- Rashid Lab: cole este arquivo inteiro no SQL Editor do Supabase e execute.
-- Todas as tabelas pertencem a quem está logado (user_id) e só essa pessoa lê ou escreve.

create table if not exists public.logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
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
  char text not null,
  plan text not null default '',
  avoid text not null default '',
  tools text not null default '',
  notes text not null default '',
  updated_at timestamptz not null default now(),
  primary key (user_id, char)
);

create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
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
  title text not null default 'Novo fluxograma',
  char text not null default '',
  root jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.focus (
  user_id uuid primary key default auth.uid() references auth.users(id) on delete cascade,
  text text not null default '',
  updated_at timestamptz not null default now()
);

create index if not exists logs_user_played on public.logs (user_id, played_on desc, created_at desc);
create index if not exists combos_user on public.combos (user_id);
create index if not exists videos_user on public.videos (user_id, created_at desc);
create index if not exists flows_user on public.flows (user_id);

do $$
declare t text;
begin
  foreach t in array array['logs','combos','matchups','videos','flows','focus'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "own rows" on public.%I', t);
    execute format(
      'create policy "own rows" on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',
      t);
  end loop;
end $$;
