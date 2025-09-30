# Mindline

Aplicacion Expo orientada al bienestar integral con tareas gamificadas, misiones, estadisticas y ahora un backend real en Supabase para cuentas de usuario, logros compartidos, comunidades y cursos premium.

## Requisitos previos
- Node.js 18 o superior y npm instalado.
- Cuenta gratuita en [Supabase](https://supabase.com/).
- Dispositivo/emulador con Expo Go o navegador para la version web.

## Instalacion rapida
1. Instala dependencias:
   ```bash
   npm install
   ```
2. Define las variables de entorno en la raiz del proyecto (por ejemplo, un archivo `.env` que Expo cargara automaticamente):
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY
   ```
3. Inicia la app:
   ```bash
   npm run start
   ```
   Usa la tecla `w`, `a` o `i` segun quieras abrir web, Android o iOS.

## Configuracion de Supabase
Ejecuta el siguiente SQL en el editor de Supabase para crear el esquema minimo. Genera antes la extension `pgcrypto` si aun no existe.

```sql
create extension if not exists "pgcrypto";

-- Perfiles vinculados al usuario de auth
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  is_premium boolean default false,
  premium_expires_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

alter table public.profiles enable row level security;
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_insert" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- Logros compartidos por los usuarios
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  mood text default 'progress',
  visibility text default 'public',
  likes_count integer default 0,
  comments_count integer default 0,
  created_at timestamptz default timezone('utc', now())
);

alter table public.achievements enable row level security;
create policy "achievements_read" on public.achievements for select using (true);
create policy "achievements_insert" on public.achievements for insert with check (auth.uid() = user_id);

-- Comunidades tematicas
create table if not exists public.communities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  focus_area text,
  is_private boolean default false,
  owner_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz default timezone('utc', now())
);

alter table public.communities enable row level security;
create policy "communities_read" on public.communities for select using (true);
create policy "communities_create" on public.communities for insert with check (auth.uid() = owner_id);

create table if not exists public.community_members (
  community_id uuid references public.communities(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text default 'member',
  joined_at timestamptz default timezone('utc', now()),
  primary key (community_id, user_id)
);

alter table public.community_members enable row level security;
create policy "community_members_read" on public.community_members for select using (true);
create policy "community_members_join" on public.community_members for insert with check (auth.uid() = user_id);
create policy "community_members_leave" on public.community_members for delete using (auth.uid() = user_id);

-- Contenido educativo y suscripciones
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  category text,
  cover_url text,
  level text default 'beginner',
  duration_minutes integer default 120,
  modules_count integer default 6,
  is_premium boolean default false,
  price numeric(10,2) default 0,
  created_at timestamptz default timezone('utc', now())
);

create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  duration_months integer not null,
  price numeric(10,2) not null,
  features text[] default array[]::text[],
  popular boolean default false
);

create table if not exists public.user_subscriptions (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  plan_id uuid references public.subscription_plans(id) on delete set null,
  status text default 'active',
  started_at timestamptz default timezone('utc', now()),
  expires_at timestamptz,
  created_at timestamptz default timezone('utc', now())
);

alter table public.user_subscriptions enable row level security;
create policy "user_subscriptions_select" on public.user_subscriptions for select using (auth.uid() = user_id);
create policy "user_subscriptions_upsert" on public.user_subscriptions for insert with check (auth.uid() = user_id);
create policy "user_subscriptions_update" on public.user_subscriptions for update using (auth.uid() = user_id);

-- Datos iniciales opcionales
insert into public.subscription_plans (name, duration_months, price, features, popular)
values
  ('Plan mensual', 1, 9.99, '{"Acceso ilimitado a cursos premium","Soporte comunitario prioritario"}', true),
  ('Plan trimestral', 3, 24.99, '{"Material descargable","Sesiones grupales guiadas"}', false),
  ('Plan anual', 12, 79.99, '{"Acompanamiento experto","Eventos exclusivos"}', false)
on conflict (id) do nothing;

insert into public.courses (title, description, category, level, duration_minutes, modules_count, is_premium, price)
values
  ('Gestion de la ansiedad diaria', 'Tecnicas y habitos para regular la respuesta al estres.', 'Ansiedad', 'beginner', 180, 6, true, 29.99),
  ('Mindfulness para principiantes', 'Serie guiada para introducir la atencion plena en tu rutina.', 'Mindfulness', 'beginner', 150, 5, false, 0),
  ('Resiliencia emocional avanzada', 'Profundiza en herramientas para afrontar recaidas y mejorar tu dialogo interno.', 'Resiliencia', 'advanced', 240, 8, true, 39.99)
on conflict (id) do nothing;
```

> **Nota:** si utilizas politicas adicionales o cambias los nombres de las columnas, actualiza los servicios en `services/` en consecuencia.

## Nuevas secciones de la app
- **Logros** (`/(tabs)/achievements`): comparte hitos personales, elige el estado de animo y controla la visibilidad.
- **Comunidades** (`/(tabs)/communities`): crea espacios por tematica, unete o sal de grupos y lleva el recuento de miembros.
- **Cursos** (`/(tabs)/courses`): consulta planes de suscripcion, activa/cancela tu plan y revisa el catalogo de cursos (el contenido premium se bloquea si no tienes suscripcion activa).

Las secciones existentes de tareas, misiones y estadisticas continuan funcionando con el almacenamiento local previo.

## Flujo recomendado de pruebas
1. Registrate con un correo nuevo y verifica en la tabla `profiles` que se creo tu perfil.
2. Desde la pestana **Logros**, publica un par de entradas y comprueba que aparecen en la tabla `achievements`.
3. Crea una comunidad, unete a ella con otra cuenta de prueba y revisa el contador en Supabase.
4. Activa y cancela un plan desde la pestana **Cursos** validando la tabla `user_subscriptions`.
5. Reabre la app para confirmar que la sesion persiste gracias a `supabase.auth`.

Si encuentras problemas, revisa la consola del bundler de Expo y el panel de Supabase para obtener mas contexto (politicas RLS, logs de autenticacion, etc.).



