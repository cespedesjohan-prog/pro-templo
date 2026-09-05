-- Gestion Iglesia: ministerios e integrantes.
-- Un miembro puede pertenecer a varios ministerios.

create extension if not exists pgcrypto;

create table if not exists public.ministerios (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  icono text not null default '🤝',
  color text not null default 'blue',
  activo boolean not null default true,
  creado_en timestamptz not null default timezone('utc', now()),
  actualizado_en timestamptz not null default timezone('utc', now()),
  constraint ministerios_nombre_unico unique (nombre)
);

alter table public.ministerios
  add column if not exists descripcion text,
  add column if not exists icono text not null default '🤝',
  add column if not exists color text not null default 'blue',
  add column if not exists activo boolean not null default true,
  add column if not exists creado_en timestamptz not null default timezone('utc', now()),
  add column if not exists actualizado_en timestamptz not null default timezone('utc', now());

create table if not exists public.ministerio_integrantes (
  ministerio_id uuid not null references public.ministerios(id) on delete cascade,
  miembro_id uuid not null references public.miembros(id) on delete cascade,
  es_lider boolean not null default false,
  creado_en timestamptz not null default timezone('utc', now()),
  primary key (ministerio_id, miembro_id)
);

create index if not exists ministerio_integrantes_miembro_idx
  on public.ministerio_integrantes(miembro_id);

create index if not exists ministerio_integrantes_ministerio_idx
  on public.ministerio_integrantes(ministerio_id);

grant select, insert, update, delete on public.ministerios to authenticated;
grant select, insert, update, delete on public.ministerio_integrantes to authenticated;

alter table public.ministerios enable row level security;
alter table public.ministerio_integrantes enable row level security;

drop policy if exists "Usuarios autenticados pueden ver ministerios" on public.ministerios;
create policy "Usuarios autenticados pueden ver ministerios"
  on public.ministerios for select to authenticated using (true);

drop policy if exists "Usuarios autenticados pueden crear ministerios" on public.ministerios;
create policy "Usuarios autenticados pueden crear ministerios"
  on public.ministerios for insert to authenticated with check (true);

drop policy if exists "Usuarios autenticados pueden modificar ministerios" on public.ministerios;
create policy "Usuarios autenticados pueden modificar ministerios"
  on public.ministerios for update to authenticated using (true) with check (true);

drop policy if exists "Usuarios autenticados pueden eliminar ministerios" on public.ministerios;
create policy "Usuarios autenticados pueden eliminar ministerios"
  on public.ministerios for delete to authenticated using (true);

drop policy if exists "Usuarios autenticados pueden ver integrantes" on public.ministerio_integrantes;
create policy "Usuarios autenticados pueden ver integrantes"
  on public.ministerio_integrantes for select to authenticated using (true);

drop policy if exists "Usuarios autenticados pueden agregar integrantes" on public.ministerio_integrantes;
create policy "Usuarios autenticados pueden agregar integrantes"
  on public.ministerio_integrantes for insert to authenticated with check (true);

drop policy if exists "Usuarios autenticados pueden actualizar integrantes" on public.ministerio_integrantes;
create policy "Usuarios autenticados pueden actualizar integrantes"
  on public.ministerio_integrantes for update to authenticated using (true) with check (true);

drop policy if exists "Usuarios autenticados pueden quitar integrantes" on public.ministerio_integrantes;
create policy "Usuarios autenticados pueden quitar integrantes"
  on public.ministerio_integrantes for delete to authenticated using (true);

notify pgrst, 'reload schema';