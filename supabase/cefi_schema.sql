-- CEFI / Escuelas - esquema base para Supabase
-- Ejecutar completo en Supabase > SQL Editor.
-- Todas las tablas usan el prefijo cefi_ para no interferir con PRO TEMPLO.

create extension if not exists pgcrypto;

create or replace function public.cefi_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.cefi_periodos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_periodos_fechas_validas check (fecha_fin >= fecha_inicio),
  constraint cefi_periodos_nombre_unico unique (nombre)
);

create table if not exists public.cefi_grados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  orden integer not null default 1,
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_grados_orden_positivo check (orden > 0),
  constraint cefi_grados_nombre_unico unique (nombre)
);

create table if not exists public.cefi_grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  grado_id uuid not null references public.cefi_grados(id) on delete restrict,
  periodo_id uuid not null references public.cefi_periodos(id) on delete restrict,
  cupo integer,
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_grupos_cupo_valido check (cupo is null or cupo > 0),
  constraint cefi_grupos_nombre_periodo_unico unique (nombre, periodo_id)
);

create table if not exists public.cefi_docentes (
  id uuid primary key default gen_random_uuid(),
  nombres text not null,
  apellidos text not null,
  documento text,
  telefono text,
  correo text,
  especialidad text,
  estado text not null default 'activo',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_docentes_estado_valido check (estado in ('activo', 'inactivo')),
  constraint cefi_docentes_documento_unico unique (documento)
);

create table if not exists public.cefi_materias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  horas_semana numeric(4,1),
  activo boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_materias_horas_validas check (horas_semana is null or horas_semana > 0),
  constraint cefi_materias_nombre_unico unique (nombre)
);

create table if not exists public.cefi_matriculas (
  id uuid primary key default gen_random_uuid(),
  miembro_id uuid not null references public.miembros(id) on delete restrict,
  grupo_id uuid not null references public.cefi_grupos(id) on delete restrict,
  fecha_matricula date not null default current_date,
  estado text not null default 'activa',
  observaciones text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_matriculas_estado_valido check (estado in ('activa', 'cancelada', 'finalizada')),
  constraint cefi_matriculas_miembro_grupo_unico unique (miembro_id, grupo_id)
);

create table if not exists public.cefi_asignaciones (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references public.cefi_grupos(id) on delete cascade,
  materia_id uuid not null references public.cefi_materias(id) on delete restrict,
  docente_id uuid references public.cefi_docentes(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_asignaciones_grupo_materia_unica unique (grupo_id, materia_id)
);

create table if not exists public.cefi_asistencias (
  id uuid primary key default gen_random_uuid(),
  matricula_id uuid not null references public.cefi_matriculas(id) on delete cascade,
  fecha date not null default current_date,
  estado text not null default 'presente',
  observacion text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_asistencias_estado_valido check (estado in ('presente', 'ausente', 'tarde', 'excusa')),
  constraint cefi_asistencias_fecha_unica unique (matricula_id, fecha)
);

create table if not exists public.cefi_calificaciones (
  id uuid primary key default gen_random_uuid(),
  matricula_id uuid not null references public.cefi_matriculas(id) on delete cascade,
  asignacion_id uuid not null references public.cefi_asignaciones(id) on delete cascade,
  periodo_numero smallint not null default 1,
  nota numeric(5,2),
  observacion text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint cefi_calificaciones_periodo_valido check (periodo_numero between 1 and 4),
  constraint cefi_calificaciones_nota_valida check (nota is null or (nota >= 0 and nota <= 5)),
  constraint cefi_calificaciones_unica unique (matricula_id, asignacion_id, periodo_numero)
);

create index if not exists cefi_grupos_grado_idx on public.cefi_grupos(grado_id);
create index if not exists cefi_grupos_periodo_idx on public.cefi_grupos(periodo_id);
-- Permite continuar si cefi_matriculas fue creada en una ejecucion anterior.
alter table if exists public.cefi_matriculas
  add column if not exists miembro_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.cefi_matriculas'::regclass
      and conname = 'cefi_matriculas_miembro_id_fkey'
  ) then
    alter table public.cefi_matriculas
      add constraint cefi_matriculas_miembro_id_fkey
      foreign key (miembro_id) references public.miembros(id) on delete restrict;
  end if;
end $$;

create index if not exists cefi_matriculas_miembro_idx on public.cefi_matriculas(miembro_id);
create index if not exists cefi_matriculas_grupo_idx on public.cefi_matriculas(grupo_id);
create index if not exists cefi_asistencias_fecha_idx on public.cefi_asistencias(fecha);
create index if not exists cefi_calificaciones_matricula_idx on public.cefi_calificaciones(matricula_id);

-- Actualiza updated_at automáticamente en cada modificación.
drop trigger if exists cefi_periodos_updated_at on public.cefi_periodos;
create trigger cefi_periodos_updated_at before update on public.cefi_periodos
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_grados_updated_at on public.cefi_grados;
create trigger cefi_grados_updated_at before update on public.cefi_grados
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_grupos_updated_at on public.cefi_grupos;
create trigger cefi_grupos_updated_at before update on public.cefi_grupos
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_docentes_updated_at on public.cefi_docentes;
create trigger cefi_docentes_updated_at before update on public.cefi_docentes
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_materias_updated_at on public.cefi_materias;
create trigger cefi_materias_updated_at before update on public.cefi_materias
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_matriculas_updated_at on public.cefi_matriculas;
create trigger cefi_matriculas_updated_at before update on public.cefi_matriculas
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_asignaciones_updated_at on public.cefi_asignaciones;
create trigger cefi_asignaciones_updated_at before update on public.cefi_asignaciones
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_asistencias_updated_at on public.cefi_asistencias;
create trigger cefi_asistencias_updated_at before update on public.cefi_asistencias
for each row execute function public.cefi_set_updated_at();

drop trigger if exists cefi_calificaciones_updated_at on public.cefi_calificaciones;
create trigger cefi_calificaciones_updated_at before update on public.cefi_calificaciones
for each row execute function public.cefi_set_updated_at();

-- Seguridad inicial: solo usuarios autenticados pueden consultar y modificar CEFI.
do $$
declare
  tabla text;
begin
  foreach tabla in array array[
    'cefi_periodos', 'cefi_grados', 'cefi_grupos',
    'cefi_docentes', 'cefi_materias', 'cefi_matriculas', 'cefi_asignaciones',
    'cefi_asistencias', 'cefi_calificaciones'
  ] loop
    execute format('alter table public.%I enable row level security', tabla);
    execute format('drop policy if exists %I on public.%I', tabla || '_authenticated_all', tabla);
    execute format(
      'create policy %I on public.%I for all to authenticated using (true) with check (true)',
      tabla || '_authenticated_all', tabla
    );
  end loop;
end $$;

-- Datos iniciales opcionales para comenzar la configuración.
insert into public.cefi_grados (nombre, orden)
values
  ('Nivel 1', 1),
  ('Nivel 2', 2),
  ('Nivel 3', 3),
  ('Nivel 4', 4)
on conflict (nombre) do nothing;
