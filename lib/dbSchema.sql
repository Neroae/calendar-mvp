-- Users table: stores application users.
create table if not exists public.users (
  id uuid default uuid_generate_v4() not null primary key,
  name text not null,
  email text not null unique,
  tz text default 'UTC' not null,
  created_at timestamp with time zone default now() not null
);

-- Teams table: logical grouping of users.
create table if not exists public.teams (
  id uuid default uuid_generate_v4() not null primary key,
  name text not null,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- Roles table: roles within a team.
create table if not exists public.roles (
  id uuid default uuid_generate_v4() not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  name text not null,
  is_lead boolean default false,
  created_at timestamp with time zone default now() not null
);

-- Role members table: many‑to‑many relationship between roles and users.
create table if not exists public.role_members (
  role_id uuid not null references public.roles (id) on delete cascade,
  user_id uuid not null references public.users (id) on delete cascade,
  active boolean default true,
  joined_at timestamp with time zone default now() not null,
  primary key (role_id, user_id)
);

-- Tasks table: tasks with metadata.
create type public.task_status as enum ('todo','in_progress','done');
create type public.task_priority as enum ('low','medium','high');

create table if not exists public.tasks (
  id uuid default uuid_generate_v4() not null primary key,
  team_id uuid not null references public.teams (id) on delete cascade,
  title text not null,
  description text,
  priority public.task_priority default 'medium' not null,
  status public.task_status default 'todo' not null,
  due_at timestamp with time zone not null,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamp with time zone default now() not null
);

-- Task assignments: link tasks to roles and optionally to a specific user.
create table if not exists public.task_assignments (
  task_id uuid not null references public.tasks (id) on delete cascade,
  role_id uuid not null references public.roles (id) on delete cascade,
  user_id uuid references public.users (id) on delete set null,
  primary key (task_id, role_id)
);

-- Reminders table: minutes before due date when notifications should be sent.
create table if not exists public.reminders (
  id uuid default uuid_generate_v4() not null primary key,
  task_id uuid not null references public.tasks (id) on delete cascade,
  minutes_before integer not null check (minutes_before > 0),
  created_at timestamp with time zone default now() not null
);

-- Activity log table: captures changes to tasks.
create table if not exists public.activity (
  id uuid default uuid_generate_v4() not null primary key,
  task_id uuid references public.tasks (id) on delete cascade,
  actor_id uuid references public.users (id) on delete set null,
  action text not null,
  metadata jsonb,
  created_at timestamp with time zone default now() not null
);

-- Convenience view: tasks with aggregated assignment and role data.
create view public.tasks_view as
select
  t.id,
  t.team_id,
  t.title,
  t.description,
  t.priority,
  t.status,
  t.due_at,
  json_agg(json_build_object(
    'role_id', ta.role_id,
    'user_id', ta.user_id
  )) as assignments
from public.tasks t
left join public.task_assignments ta on ta.task_id = t.id
group by t.id;
