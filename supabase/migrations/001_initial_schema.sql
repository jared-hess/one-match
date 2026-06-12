-- DateJared initial Supabase backend contract.
-- This migration is designed for Supabase Postgres. It relies on auth.uid()
-- and uses SECURITY DEFINER helper functions to avoid recursive RLS checks.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text,
  role text not null default 'user' check (role in ('user', 'jared')),
  display_name text,
  city text,
  bio text,
  looking_for text,
  good_first_date text,
  social_link text,
  photo_urls text[] not null default '{}',
  age_confirmed boolean not null default false,
  onboarding_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jared_profiles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  internal_label text not null,
  display_name text not null default 'Jared',
  age_label text not null default '30-ish',
  location text not null default 'Oakland',
  bio text not null,
  prompts jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  image_urls text[] not null default '{}',
  sort_order integer not null default 0,
  demo_eligible boolean not null default true,
  active boolean not null default true,
  archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jared_profiles_display_name_jared check (display_name = 'Jared'),
  constraint jared_profiles_active_archived_consistency check (active or archived)
);

create table if not exists public.swipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  jared_profile_id uuid not null references public.jared_profiles(id) on delete restrict,
  direction text not null check (direction in ('left', 'right', 'super')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, jared_profile_id)
);

create table if not exists public.relationships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  jared_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'matched', 'passed', 'unmatched', 'archived')),
  first_liked_profile_id uuid references public.jared_profiles(id) on delete set null,
  latest_liked_profile_id uuid references public.jared_profiles(id) on delete set null,
  decided_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, jared_user_id),
  constraint relationships_no_self_match check (user_id <> jared_user_id),
  constraint relationships_decided_timestamp check (status = 'pending' or decided_at is not null)
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null unique references public.relationships(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  jared_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint conversations_no_self_chat check (user_id <> jared_user_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  body text not null check (length(trim(body)) between 1 and 4000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.jared_notes (
  id uuid primary key default gen_random_uuid(),
  relationship_id uuid not null references public.relationships(id) on delete cascade,
  author_user_id uuid not null references auth.users(id) on delete cascade,
  note text not null check (length(trim(note)) between 1 and 4000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'requested' check (status in ('requested', 'completed')),
  requested_at timestamptz not null default now(),
  completed_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint deletion_requests_completed_timestamp check (status <> 'completed' or completed_at is not null)
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists jared_profiles_active_sort_idx on public.jared_profiles(active, archived, sort_order);
create index if not exists jared_profiles_demo_eligible_idx on public.jared_profiles(demo_eligible);
create index if not exists swipes_user_id_idx on public.swipes(user_id);
create index if not exists swipes_jared_profile_id_idx on public.swipes(jared_profile_id);
create index if not exists swipes_direction_idx on public.swipes(direction);
create index if not exists relationships_user_status_idx on public.relationships(user_id, status);
create index if not exists relationships_jared_status_idx on public.relationships(jared_user_id, status);
create index if not exists relationships_latest_liked_profile_idx on public.relationships(latest_liked_profile_id);
create index if not exists conversations_user_status_idx on public.conversations(user_id, status);
create index if not exists conversations_jared_status_idx on public.conversations(jared_user_id, status);
create index if not exists messages_conversation_created_idx on public.messages(conversation_id, created_at);
create index if not exists messages_sender_idx on public.messages(sender_id);
create index if not exists jared_notes_author_idx on public.jared_notes(author_user_id);
create index if not exists deletion_requests_user_status_idx on public.deletion_requests(user_id, status);
create index if not exists deletion_requests_status_idx on public.deletion_requests(status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_jared_profiles_updated_at on public.jared_profiles;
create trigger set_jared_profiles_updated_at before update on public.jared_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_swipes_updated_at on public.swipes;
create trigger set_swipes_updated_at before update on public.swipes
for each row execute function public.set_updated_at();

drop trigger if exists set_relationships_updated_at on public.relationships;
create trigger set_relationships_updated_at before update on public.relationships
for each row execute function public.set_updated_at();

drop trigger if exists set_conversations_updated_at on public.conversations;
create trigger set_conversations_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

drop trigger if exists set_jared_notes_updated_at on public.jared_notes;
create trigger set_jared_notes_updated_at before update on public.jared_notes
for each row execute function public.set_updated_at();

drop trigger if exists set_deletion_requests_updated_at on public.deletion_requests;
create trigger set_deletion_requests_updated_at before update on public.deletion_requests
for each row execute function public.set_updated_at();

create or replace function public.is_jared()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.user_id = auth.uid()
      and p.role = 'jared'
  );
$$;

create or replace function public.current_jared_user_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.user_id
  from public.profiles p
  where p.role = 'jared'
  order by p.created_at asc
  limit 1;
$$;

create or replace function public.can_access_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.conversations c
    join public.relationships r on r.id = c.relationship_id
    where c.id = p_conversation_id
      and c.status = 'open'
      and r.status = 'matched'
      and auth.uid() in (c.user_id, c.jared_user_id)
  );
$$;

create or replace function public.record_swipe(
  p_jared_profile_id uuid,
  p_direction text
)
returns public.swipes
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_jared_user_id uuid;
  v_swipe public.swipes;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_direction not in ('left', 'right', 'super') then
    raise exception 'Invalid swipe direction';
  end if;

  if public.is_jared() then
    raise exception 'Jared accounts cannot record normal-user swipes';
  end if;

  if not exists (
    select 1 from public.jared_profiles jp
    where jp.id = p_jared_profile_id
      and jp.active = true
      and jp.archived = false
  ) then
    raise exception 'Jared profile is unavailable';
  end if;

  insert into public.swipes (user_id, jared_profile_id, direction)
  values (v_user_id, p_jared_profile_id, p_direction)
  on conflict (user_id, jared_profile_id) do update
    set direction = excluded.direction,
        updated_at = now()
  returning * into v_swipe;

  if p_direction in ('right', 'super') then
    select public.current_jared_user_id() into v_jared_user_id;
    if v_jared_user_id is null then
      raise exception 'Jared auth profile must be bootstrapped before matching';
    end if;

    insert into public.relationships (
      user_id,
      jared_user_id,
      status,
      first_liked_profile_id,
      latest_liked_profile_id
    )
    values (v_user_id, v_jared_user_id, 'pending', p_jared_profile_id, p_jared_profile_id)
    on conflict (user_id, jared_user_id) do update
      set latest_liked_profile_id = excluded.latest_liked_profile_id,
          updated_at = now()
      where public.relationships.status in ('pending', 'passed');
  end if;

  return v_swipe;
end;
$$;

create or replace function public.ensure_conversation_for_match(
  p_relationship_id uuid
)
returns public.conversations
language plpgsql
security definer
set search_path = public
as $$
declare
  v_relationship public.relationships;
  v_conversation public.conversations;
begin
  select * into v_relationship
  from public.relationships
  where id = p_relationship_id;

  if v_relationship.id is null then
    raise exception 'Relationship not found';
  end if;

  if auth.uid() not in (v_relationship.user_id, v_relationship.jared_user_id) then
    raise exception 'Conversation access denied';
  end if;

  if v_relationship.status <> 'matched' then
    raise exception 'Conversation requires a matched relationship';
  end if;

  insert into public.conversations (relationship_id, user_id, jared_user_id, status)
  values (v_relationship.id, v_relationship.user_id, v_relationship.jared_user_id, 'open')
  on conflict (relationship_id) do update
    set status = 'open',
        updated_at = now()
  returning * into v_conversation;

  return v_conversation;
end;
$$;

create or replace function public.jared_decide_relationship(
  p_relationship_id uuid,
  p_status text
)
returns public.relationships
language plpgsql
security definer
set search_path = public
as $$
declare
  v_relationship public.relationships;
begin
  if not public.is_jared() then
    raise exception 'Only Jared can decide relationships';
  end if;

  if p_status not in ('matched', 'passed', 'unmatched', 'archived') then
    raise exception 'Invalid Jared relationship decision';
  end if;

  update public.relationships
  set status = p_status,
      jared_user_id = auth.uid(),
      decided_at = now(),
      updated_at = now()
  where id = p_relationship_id
    and jared_user_id = auth.uid()
  returning * into v_relationship;

  if v_relationship.id is null then
    raise exception 'Relationship not found or not assigned to this Jared account';
  end if;

  if p_status = 'matched' then
    perform public.ensure_conversation_for_match(v_relationship.id);
  end if;

  return v_relationship;
end;
$$;

create or replace function public.request_deletion()
returns public.deletion_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.deletion_requests;
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  insert into public.deletion_requests (user_id, status)
  values (auth.uid(), 'requested')
  returning * into v_request;

  return v_request;
end;
$$;

alter table public.profiles enable row level security;
alter table public.jared_profiles enable row level security;
alter table public.swipes enable row level security;
alter table public.relationships enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.jared_notes enable row level security;
alter table public.deletion_requests enable row level security;

drop policy if exists "profiles_select_own_or_jared" on public.profiles;
create policy "profiles_select_own_or_jared" on public.profiles
for select using (user_id = auth.uid() or public.is_jared());

drop policy if exists "profiles_insert_own_user" on public.profiles;
create policy "profiles_insert_own_user" on public.profiles
for insert with check (user_id = auth.uid() and role = 'user');

drop policy if exists "profiles_update_own_user_fields" on public.profiles;
create policy "profiles_update_own_user_fields" on public.profiles
for update using (user_id = auth.uid() and role = 'user')
with check (user_id = auth.uid() and role = 'user');

drop policy if exists "profiles_jared_update_all" on public.profiles;
create policy "profiles_jared_update_all" on public.profiles
for update using (public.is_jared()) with check (public.is_jared());

drop policy if exists "jared_profiles_select_active" on public.jared_profiles;
create policy "jared_profiles_select_active" on public.jared_profiles
for select using ((active = true and archived = false) or public.is_jared());

drop policy if exists "jared_profiles_jared_insert" on public.jared_profiles;
create policy "jared_profiles_jared_insert" on public.jared_profiles
for insert with check (public.is_jared());

drop policy if exists "jared_profiles_jared_update" on public.jared_profiles;
create policy "jared_profiles_jared_update" on public.jared_profiles
for update using (public.is_jared()) with check (public.is_jared());

drop policy if exists "jared_profiles_jared_delete" on public.jared_profiles;
create policy "jared_profiles_jared_delete" on public.jared_profiles
for delete using (public.is_jared());

drop policy if exists "swipes_select_own_or_jared" on public.swipes;
create policy "swipes_select_own_or_jared" on public.swipes
for select using (user_id = auth.uid() or public.is_jared());

drop policy if exists "swipes_insert_own" on public.swipes;
create policy "swipes_insert_own" on public.swipes
for insert with check (user_id = auth.uid() and not public.is_jared());

drop policy if exists "relationships_select_participant_or_jared" on public.relationships;
create policy "relationships_select_participant_or_jared" on public.relationships
for select using (auth.uid() in (user_id, jared_user_id) or public.is_jared());

drop policy if exists "relationships_insert_pending_own" on public.relationships;
create policy "relationships_insert_pending_own" on public.relationships
for insert with check (
  user_id = auth.uid()
  and status = 'pending'
  and jared_user_id = public.current_jared_user_id()
  and first_liked_profile_id is not null
  and latest_liked_profile_id is not null
  and decided_at is null
  and not public.is_jared()
);

drop policy if exists "relationships_update_pending_context_own" on public.relationships;
create policy "relationships_update_pending_context_own" on public.relationships
for update using (user_id = auth.uid() and status in ('pending', 'passed'))
with check (
  user_id = auth.uid()
  and status = 'pending'
  and decided_at is null
  and not public.is_jared()
);

drop policy if exists "relationships_jared_update" on public.relationships;
create policy "relationships_jared_update" on public.relationships
for update using (public.is_jared()) with check (public.is_jared());

drop policy if exists "conversations_select_matched_participants" on public.conversations;
create policy "conversations_select_matched_participants" on public.conversations
for select using (public.can_access_conversation(id) or public.is_jared());

drop policy if exists "conversations_insert_matched_participants" on public.conversations;
create policy "conversations_insert_matched_participants" on public.conversations
for insert with check (
  auth.uid() in (user_id, jared_user_id)
  and exists (
    select 1 from public.relationships r
    where r.id = relationship_id
      and r.status = 'matched'
      and r.user_id = conversations.user_id
      and r.jared_user_id = conversations.jared_user_id
  )
);

drop policy if exists "conversations_update_participants" on public.conversations;
create policy "conversations_update_participants" on public.conversations
for update using (auth.uid() in (user_id, jared_user_id) or public.is_jared())
with check (auth.uid() in (user_id, jared_user_id) or public.is_jared());

drop policy if exists "messages_select_open_participants" on public.messages;
create policy "messages_select_open_participants" on public.messages
for select using (public.can_access_conversation(conversation_id));

drop policy if exists "messages_insert_open_participants" on public.messages;
create policy "messages_insert_open_participants" on public.messages
for insert with check (
  sender_id = auth.uid()
  and public.can_access_conversation(conversation_id)
);

drop policy if exists "messages_update_read_receipts" on public.messages;
create policy "messages_update_read_receipts" on public.messages
for update using (public.can_access_conversation(conversation_id))
with check (public.can_access_conversation(conversation_id));

drop policy if exists "jared_notes_select_jared" on public.jared_notes;
create policy "jared_notes_select_jared" on public.jared_notes
for select using (public.is_jared());

drop policy if exists "jared_notes_insert_jared" on public.jared_notes;
create policy "jared_notes_insert_jared" on public.jared_notes
for insert with check (public.is_jared() and author_user_id = auth.uid());

drop policy if exists "jared_notes_update_jared" on public.jared_notes;
create policy "jared_notes_update_jared" on public.jared_notes
for update using (public.is_jared()) with check (public.is_jared());

drop policy if exists "jared_notes_delete_jared" on public.jared_notes;
create policy "jared_notes_delete_jared" on public.jared_notes
for delete using (public.is_jared());

drop policy if exists "deletion_requests_select_own_or_jared" on public.deletion_requests;
create policy "deletion_requests_select_own_or_jared" on public.deletion_requests
for select using (user_id = auth.uid() or public.is_jared());

drop policy if exists "deletion_requests_insert_own" on public.deletion_requests;
create policy "deletion_requests_insert_own" on public.deletion_requests
for insert with check (user_id = auth.uid());

drop policy if exists "deletion_requests_jared_update" on public.deletion_requests;
create policy "deletion_requests_jared_update" on public.deletion_requests
for update using (public.is_jared()) with check (public.is_jared());

grant execute on function public.is_jared() to authenticated;
grant execute on function public.current_jared_user_id() to authenticated;
grant execute on function public.record_swipe(uuid, text) to authenticated;
grant execute on function public.jared_decide_relationship(uuid, text) to authenticated;
grant execute on function public.ensure_conversation_for_match(uuid) to authenticated;
grant execute on function public.request_deletion() to authenticated;
