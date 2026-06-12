# one-match Supabase setup

This folder contains the one-match Supabase backend contract for the first release, including schema, RLS policies, security-definer RPCs, seed data, storage setup notes, and privileged operator bootstrap guidance. It avoids service-role keys, real project URLs, OAuth secrets, and private operator values.

## Apply migration and seed

1. Create or select a Supabase project.
2. Apply `supabase/migrations/001_initial_schema.sql` with the Supabase CLI, dashboard SQL editor, or your deployment pipeline.
3. Apply `supabase/seed.sql` after the migration.
4. Confirm every public table has RLS enabled before connecting the frontend.

The migration uses `create extension if not exists pgcrypto` for `gen_random_uuid()` and references `auth.uid()`, so it should be run in Supabase Postgres unless your local Postgres stub includes the `auth` schema.

## Auth and OAuth redirects

Configure Google OAuth in Supabase Auth and add these redirect URLs:

- `http://localhost:5173/auth/callback`
- `https://<production-domain>/auth/callback`
- `<custom-scheme>://auth/callback`

Keep provider client IDs/secrets in the Supabase dashboard or environment manager. Do not commit them.

## Privileged operator bootstrap

Normal frontend profile creation is restricted to `role = 'user'`; a privileged operator account must be promoted manually after the trusted operator signs in and creates a profile.

Email path:

```sql
update public.profiles
set role = '<PRIVILEGED_ROLE_VALUE>', updated_at = now()
where lower(email) = lower('<OPERATOR_EMAIL_HERE>');
```

Auth user id path:

```sql
update public.profiles
set role = '<PRIVILEGED_ROLE_VALUE>', updated_at = now()
where user_id = '<OPERATOR_AUTH_USER_ID_HERE>'::uuid;
```

Verify only the intended operator profile is privileged:

```sql
select user_id, email, role
from public.profiles
where role = '<PRIVILEGED_ROLE_VALUE>';
```

For authoritative table, policy, bucket, and RPC names, use:

- `supabase/migrations/001_initial_schema.sql`
- `supabase/seed.sql`

## Backend contract summary

The migration defines:

- profile rows with role gating for normal users and the privileged operator,
- swipe deck entries for discovery content,
- swipe and relationship state,
- conversation and message records,
- moderation notes and deletion request records.

Prefer the RPCs in migration SQL for multi-step writes and server-side consistency.

## Storage bucket setup

Create buckets in Supabase Storage:

1. Public operator profile media bucket.
   - Public read access.
   - Privileged operator writes.
   - Store references used by the seeded operator profile rows.
2. Optional private user media bucket.
   - Owner-only access by default.
   - Add operator read only where moderation or matching workflows need it.

Example dashboard SQL for `storage.objects` policies after buckets exist (bucket names are placeholders):

```sql
create policy "operator profile photos public read"
on storage.objects for select
using (bucket_id = '<OPERATOR_MEDIA_BUCKET_NAME_HERE>');

create policy "operator profile photos operator write"
on storage.objects for insert
with check (
  bucket_id = '<OPERATOR_MEDIA_BUCKET_NAME_HERE>'
  and <OPERATOR_AUTHZ_PREDICATE>
);

create policy "operator profile photos operator update"
on storage.objects for update
using (
  bucket_id = '<OPERATOR_MEDIA_BUCKET_NAME_HERE>'
  and <OPERATOR_AUTHZ_PREDICATE>
)
with check (
  bucket_id = '<OPERATOR_MEDIA_BUCKET_NAME_HERE>'
  and <OPERATOR_AUTHZ_PREDICATE>
);

create policy "operator profile photos operator delete"
on storage.objects for delete
using (
  bucket_id = '<OPERATOR_MEDIA_BUCKET_NAME_HERE>'
  and <OPERATOR_AUTHZ_PREDICATE>
);
```

Optional private user-photo starting point if paths are scoped as `<auth-user-id>/<filename>`:

```sql
create policy "user profile photos owner read"
on storage.objects for select
using (
  bucket_id = '<USER_MEDIA_BUCKET_NAME_HERE>'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "user profile photos owner write"
on storage.objects for insert
with check (
  bucket_id = '<USER_MEDIA_BUCKET_NAME_HERE>'
  and (storage.foldername(name))[1] = auth.uid()::text
);
```

## RLS limitations and hardening notes

- Static review can confirm policy coverage, but final authorization should be tested against a live Supabase project with representative JWTs for anonymous users, normal users, privileged operators, and cross-user cases.
- Security-definer helpers in the migration should keep `set search_path = public` when they read from `profiles` to avoid recursive policy issues.
- The first version assumes a single operator identity for uniqueness constraints. If multiple operators are later introduced, revise the operator helper and relationship assignment logic together.
- Normal users cannot promote themselves to privileged operator through exposed profile policies; promotion requires trusted SQL.
- Messaging should be gated by an open conversation and matched relationship. Do not bypass matching RPCs from client-side multi-step flows.
- Deletion requests are request-tracking rows only; the full erase/retention flow is implemented in the later privacy deletion task.
