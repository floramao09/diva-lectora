-- ============================================================
-- DIVA LECTORA — Esquema de base de datos para Supabase
-- Cómo usar: ve a tu proyecto en supabase.com → SQL Editor →
-- pega TODO este archivo → Run.
-- ============================================================

-- Tabla de perfiles (extiende la tabla de auth de Supabase)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  nombre text default 'Nueva Lectora',
  xp integer default 0,
  racha integer default 0,
  minutos_hoy integer default 0,
  ultimo_login date,
  created_at timestamp with time zone default now()
);

-- Cuando alguien se registra, crear su perfil automáticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre)
  values (new.id, coalesce(new.raw_user_meta_data->>'nombre', 'Nueva Lectora'));
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Tabla de libros en la biblioteca de cada usuaria
create table if not exists libros (
  id uuid default gen_random_uuid() primary key,
  usuaria_id uuid references profiles(id) on delete cascade not null,
  titulo text not null,
  autor text,
  archivo_url text,
  paginas_totales integer default 0,
  pagina_actual integer default 0,
  ubicacion_actual text,
  estado text default 'pendiente', -- 'leyendo' | 'leido' | 'pendiente'
  favorito boolean default false,
  created_at timestamp with time zone default now()
);

-- Subrayados / citas guardadas
create table if not exists subrayados (
  id uuid default gen_random_uuid() primary key,
  usuaria_id uuid references profiles(id) on delete cascade not null,
  libro_id uuid references libros(id) on delete cascade,
  texto text not null,
  categoria text default 'Personajes',
  favorito boolean default false,
  created_at timestamp with time zone default now()
);

-- Notas / reflexiones
create table if not exists notas (
  id uuid default gen_random_uuid() primary key,
  usuaria_id uuid references profiles(id) on delete cascade not null,
  libro_id uuid references libros(id) on delete cascade,
  texto text not null,
  created_at timestamp with time zone default now()
);

-- Conversaciones con la IA
create table if not exists conversaciones (
  id uuid default gen_random_uuid() primary key,
  usuaria_id uuid references profiles(id) on delete cascade not null,
  voz_id text not null,
  mensajes jsonb default '[]'::jsonb,
  guardada boolean default false,
  created_at timestamp with time zone default now()
);

-- Progreso en retos de autoras
create table if not exists retos_progreso (
  id uuid default gen_random_uuid() primary key,
  usuaria_id uuid references profiles(id) on delete cascade not null,
  autora text not null,
  etapa text default 'descubrir', -- 'descubrir' | 'comprender' | 'encarnar'
  paginas_leidas integer default 0,
  citas_guardadas integer default 0,
  notas_creadas integer default 0,
  chats_abiertos integer default 0,
  completado boolean default false,
  unique (usuaria_id, autora)
);

-- ============================================================
-- Seguridad: cada usuaria solo ve y modifica sus propios datos
-- ============================================================

alter table profiles enable row level security;
alter table libros enable row level security;
alter table subrayados enable row level security;
alter table notas enable row level security;
alter table conversaciones enable row level security;
alter table retos_progreso enable row level security;

create policy "Las usuarias ven su propio perfil" on profiles
  for select using (auth.uid() = id);
create policy "Las usuarias actualizan su propio perfil" on profiles
  for update using (auth.uid() = id);

create policy "Las usuarias gestionan sus propios libros" on libros
  for all using (auth.uid() = usuaria_id);

create policy "Las usuarias gestionan sus propios subrayados" on subrayados
  for all using (auth.uid() = usuaria_id);

create policy "Las usuarias gestionan sus propias notas" on notas
  for all using (auth.uid() = usuaria_id);

create policy "Las usuarias gestionan sus propias conversaciones" on conversaciones
  for all using (auth.uid() = usuaria_id);

create policy "Las usuarias gestionan su propio progreso de retos" on retos_progreso
  for all using (auth.uid() = usuaria_id);

-- ============================================================
-- Almacenamiento de archivos EPUB
-- Ve a Storage → crea un bucket llamado "epubs" (privado)
-- y luego corre esta política:
-- ============================================================

-- (Esta parte se configura desde la interfaz de Storage en Supabase,
-- pero estas políticas permiten que cada usuaria suba y lea solo sus archivos)

insert into storage.buckets (id, name, public)
values ('epubs', 'epubs', false)
on conflict (id) do nothing;

create policy "Las usuarias suben sus propios epubs"
  on storage.objects for insert
  with check (bucket_id = 'epubs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Las usuarias leen sus propios epubs"
  on storage.objects for select
  using (bucket_id = 'epubs' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Las usuarias borran sus propios epubs"
  on storage.objects for delete
  using (bucket_id = 'epubs' and auth.uid()::text = (storage.foldername(name))[1]);
