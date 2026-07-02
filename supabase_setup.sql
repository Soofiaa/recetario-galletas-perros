-- ═══════════════════════════════════════════════════════════════
-- Recetario de Olivia — Setup de Supabase
-- ═══════════════════════════════════════════════════════════════

-- Tabla de recetarios sincronizados por código de acceso
create table if not exists recetario_books (
  id text primary key,
  access_code text not null,
  name text not null,
  subtitle text,
  category text,
  created_at text,
  cover_style jsonb,
  recipes jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists idx_recetario_books_access_code on recetario_books(access_code);

-- Tabla de logs (auto-purgados a los 30 días)
create table if not exists recetario_logs (
  id bigint generated always as identity primary key,
  access_code text,
  action text not null,
  detail text,
  created_at timestamptz not null default now()
);
create index if not exists idx_recetario_logs_created_at on recetario_logs(created_at);

-- Habilitar RLS (acceso abierto vía anon key, sin login)
alter table recetario_books enable row level security;
drop policy if exists "Allow all access to books" on recetario_books;
create policy "Allow all access to books" on recetario_books for all using (true) with check (true);

alter table recetario_logs enable row level security;
drop policy if exists "Allow all access to logs" on recetario_logs;
create policy "Allow all access to logs" on recetario_logs for all using (true) with check (true);

-- Storage bucket para imágenes de recetas
insert into storage.buckets (id, name, public)
values ('recipe-images', 'recipe-images', true)
on conflict (id) do nothing;

drop policy if exists "Public read recipe images" on storage.objects;
create policy "Public read recipe images" on storage.objects
  for select using (bucket_id = 'recipe-images');

drop policy if exists "Public upload recipe images" on storage.objects;
create policy "Public upload recipe images" on storage.objects
  for insert with check (bucket_id = 'recipe-images');

drop policy if exists "Public delete recipe images" on storage.objects;
create policy "Public delete recipe images" on storage.objects
  for delete using (bucket_id = 'recipe-images');

-- Auto-purga de logs con más de 30 días (requiere extensión pg_cron)
create extension if not exists pg_cron;

select cron.schedule(
  'delete-old-recetario-logs',
  '0 3 * * *',
  $$ delete from recetario_logs where created_at < now() - interval '30 days'; $$
);
