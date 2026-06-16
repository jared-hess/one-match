# one-match

This repository contains a React, Supabase, and Capacitor matching app MVP.

## What is implemented

- Google authentication with Supabase
- Supabase-backed profiles, swipes, matches, and messaging
- Role-gated normal-user and operator routes
- Policy and legal pages:
  - `/privacy`
  - `/terms`
  - `/delete-data`

## Stack

- Vite
- React
- TypeScript
- Tailwind CSS
- React Router
- Supabase
- Capacitor Android
- Vitest
- ESLint

## Scripts, from `package.json`

Use these exact commands:

- `npm run dev`
- `npm run build`
- `npm run preview`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run cap:sync`
- `npm run android:open`
- `npm run android:run`
- `npm run format`
- `npm run format:check`
- `npm run ci`
- `npm run prepare`
- `npm run precommit`

## Quality gates

Run the local gates before opening a pull request:

- `npm run format:check`
- `npm run typecheck`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run ci`

The local pre-commit hook runs `npm run precommit`, which applies staged-file lint and format checks before a commit is created.

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Copy environment template and fill values.

```bash
cp .env.example .env
```

3. Fill required values in `.env`:

```bash
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your anon key>
VITE_SITE_URL=http://localhost:5173
VITE_APP_SCHEME=<custom app scheme>
```

4. Start the app.

```bash
npm run dev
```

## Supabase setup

Backend contract files are under `supabase/`.

### Apply migration and seed

1. Create or select a Supabase project.
2. Apply `supabase/migrations/001_initial_schema.sql`.
3. Apply `supabase/seed.sql`.
4. Confirm the expected public tables and RPCs in migration and seed files.

### OAuth redirects

Use these callback URLs in Supabase Auth provider config:

- `http://localhost:5173/auth/callback`
- `https://<production-domain>/auth/callback`
- `<custom-scheme>://auth/callback`

The callback route in this app is `src/router.tsx` path `/auth/callback`.

### Bootstrap privileged role

The normal onboarding path creates user rows with `role = 'user'`. A dedicated privileged account is promoted using SQL with placeholders only.

Use one of the following and replace `<PRIVILEGED_ROLE_VALUE>` with the value defined in migration/source-of-truth files:

```sql
update public.profiles
set role = '<PRIVILEGED_ROLE_VALUE>', updated_at = now()
where lower(email) = lower('<OPERATOR_EMAIL_HERE>');
```

or

```sql
update public.profiles
set role = '<PRIVILEGED_ROLE_VALUE>', updated_at = now()
where user_id = '<OPERATOR_AUTH_USER_ID_HERE>'::uuid;
```

Verify:

```sql
select user_id, email, role
from public.profiles
where role = '<PRIVILEGED_ROLE_VALUE>';
```

Use placeholders only. Do not commit private emails or real auth IDs.

### Storage setup

Set up these buckets in Supabase Storage:

- `<operator profile bucket>` (public read, operator-only writes)
- optional `<user profile bucket>` (private)

Use migration and seed SQL as the source of truth for your bucket and policy names.

## Capacitor and Android identity

Values are defined in app and Android configuration files:

- `capacitor.config.ts`
- `android/app/src/main/res/values/strings.xml` (`custom_url_scheme`)
- `android/app/src/main/AndroidManifest.xml` (generated activity and app config)

To run Android checks from this repo:

1. Build web assets:

```bash
npm run build
```

2. Sync to Android:

```bash
npm run cap:sync
```

3. Open Android Studio:

```bash
npm run android:open
```

4. Run on emulator or connected device:

```bash
npm run android:run
```

Re-run `npm run cap:sync` after major route, manifest, icon, or web build changes.

## Web deploy and static hosting

1. Build the production bundle:

```bash
npm run build
```

2. Deploy `dist/` to your static host.
3. Add SPA fallback routing so all frontend routes resolve to `index.html`.
4. Configure production `VITE_SITE_URL` and production callback URL.

Local smoke check:

```bash
npm run preview
```

## Verification commands

Run these after setup work:

```bash
npm run typecheck
npm run lint
npm run test
npm run build
```

Also verify README command/docs parity against `package.json` scripts and check docs for secret/path hygiene before release.

## Security and audit notes

- Policies are implemented in migration SQL and should be validated against live auth sessions.
- Anonymous, normal-user, and operator behavior should be tested with real JWTs in a staging environment.
- No service-role secrets or private email values are checked into code.

## Known limitations

- Node 18 is the practical runtime for this repo so Capacitor stays on the `6.2.1` line.
- Chromium-based browser QA is limited here because local Playwright expects Chrome at `/opt/google/chrome/chrome`.
- `npm audit --include=dev` remains constrained by environment and legacy package combinations; moving to a modernized toolchain would require broad dependency upgrades.
- Full app security and policy behavior still needs a live Supabase/JWT harness for end-to-end confirmation.
- Android verification still depends on local Android SDK/Studio, emulator/device state, and local OS signing/tooling constraints.
