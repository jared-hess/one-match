import { AuthGate } from '../components/AuthGate';
import { JaredRouteGuard } from '../components/JaredRouteGuard';
import { PlaceholderPage, type PlaceholderPageProps } from './PlaceholderPage';

type RouteConfig = PlaceholderPageProps & {
  path: string;
  guarded?: 'auth' | 'jared';
};

export const normalRouteConfigs: RouteConfig[] = [
  {
    path: '/',
    eyebrow: 'Welcome',
    title: 'A careful foundation for one very specific match.',
    description: 'DateJared is now mapped as a private, mobile-first app shell with auth-aware routes and centralized data access.',
    note: 'This welcome route is intentionally only the shell: swipe cards, Jared workflows, messaging, CMS, demo mode, and legal copy come in later tasks.'
  },
  {
    path: '/onboarding',
    eyebrow: 'Onboarding',
    title: 'Profile basics will start here.',
    description: 'An anonymous-capable placeholder for age confirmation, preferences, and first-run readiness.',
    note: 'Full onboarding fields are intentionally deferred; this route stays open so users can begin before sign-in.'
  },
  {
    path: '/preferences',
    eyebrow: 'Preferences',
    title: 'Dating preferences get a reserved room.',
    description: 'An anonymous-capable placeholder for future preference controls and matching context.',
    note: 'No preference mutation UI is implemented yet; Task 5 can use this route before auth.'
  },
  {
    path: '/swipe',
    eyebrow: 'Swipe',
    title: 'The deck route exists, but the deck is not built yet.',
    description: 'Task 5 will own swipe cards and interactions; this route only confirms navigation and data boundaries.',
    note: 'This route intentionally renders before sign-in. Persisted swipe writes are available through src/lib/swipes.ts only.'
  },
  {
    path: '/profile/:id',
    eyebrow: 'Profile',
    title: 'A Jared profile detail placeholder.',
    description: 'This anonymous-capable route reserves deep-link behavior for a single Jared profile without implementing full cards.',
    note: 'The dynamic id is displayed for routing evidence only.'
  },
  {
    path: '/complete-profile',
    guarded: 'auth',
    eyebrow: 'Complete profile',
    title: 'Your DateJared profile needs a careful finish.',
    description: 'A protected placeholder for normal-user profile completion after Google auth.',
    note: 'Profile upsert helpers capture email and force role=user, but this UI is intentionally pending.'
  },
  {
    path: '/pending',
    guarded: 'auth',
    eyebrow: 'Pending',
    title: 'Your interest can wait here gracefully.',
    description: 'A protected holding route for likes awaiting Jared decisions.',
    note: 'Jared decision business UI is deferred to Task 6.'
  },
  {
    path: '/match',
    guarded: 'auth',
    eyebrow: 'Match',
    title: 'Match state has a home.',
    description: 'A protected placeholder for matched relationship confirmation and next-step routing.',
    note: 'No full match workflow is implemented yet.'
  },
  {
    path: '/messages',
    guarded: 'auth',
    eyebrow: 'Messages',
    title: 'Conversation routes are reserved.',
    description: 'A protected placeholder for future matched messaging.',
    note: 'Task 7 owns the real messaging UI and realtime behavior.'
  },
  {
    path: '/settings',
    guarded: 'auth',
    eyebrow: 'Settings',
    title: 'Account settings will live here.',
    description: 'A protected placeholder for privacy, account, and sign-out settings.',
    note: 'Deletion request and settings workflows are intentionally not complete in this task.'
  },
  {
    path: '/privacy',
    eyebrow: 'Privacy',
    title: 'Privacy copy route is ready for legal content.',
    description: 'This public placeholder reserves the privacy policy path.',
    note: 'Legal copy is not implemented yet.'
  },
  {
    path: '/terms',
    eyebrow: 'Terms',
    title: 'Terms route is ready for legal content.',
    description: 'This public placeholder reserves the terms of service path.',
    note: 'Legal copy is not implemented yet.'
  },
  {
    path: '/delete-data',
    eyebrow: 'Delete data',
    title: 'Data deletion guidance has a public destination.',
    description: 'This placeholder will later explain signed-in request behavior and anonymous guidance without blocking the route today.',
    note: 'The backend status contract includes requested, completed, and cancelled; Task 10 owns the real request workflow.'
  }
];

export const jaredRouteConfigs: RouteConfig[] = [
  {
    path: '/jared',
    guarded: 'jared',
    eyebrow: 'Jared workspace',
    title: 'A private control room for Jared.',
    description: 'The guarded Jared landing route is present without exposing workflows to normal users.',
    note: 'Inbound review, decisions, CMS, messages, settings, and demo controls are only placeholders.'
  },
  {
    path: '/jared/inbound',
    guarded: 'jared',
    eyebrow: 'Inbound',
    title: 'Inbound interest will queue here.',
    description: 'A guarded placeholder for Jared to review pending relationships.',
    note: 'Task 6 owns the actual inbound business UI.'
  },
  {
    path: '/jared/inbound/:id',
    guarded: 'jared',
    eyebrow: 'Inbound detail',
    title: 'A single inbound relationship route is reserved.',
    description: 'A guarded dynamic placeholder for reviewing one interested user.',
    note: 'Relationship decision helpers exist in src/lib/relationships.ts; UI comes later.'
  },
  {
    path: '/jared/matches',
    guarded: 'jared',
    eyebrow: 'Matches',
    title: 'Jared match management has a guarded path.',
    description: 'A placeholder for matched and archived relationship states.',
    note: 'No match management table or workflow is implemented yet.'
  },
  {
    path: '/jared/messages',
    guarded: 'jared',
    eyebrow: 'Jared messages',
    title: 'Jared conversation routing exists.',
    description: 'A guarded placeholder for Jared-side messaging.',
    note: 'Task 7 owns full messaging and realtime UI.'
  },
  {
    path: '/jared/messages/:id',
    guarded: 'jared',
    eyebrow: 'Jared message detail',
    title: 'A single conversation route is reserved.',
    description: 'A guarded dynamic placeholder for one conversation.',
    note: 'The id is displayed only to prove route mapping.'
  },
  {
    path: '/jared/profiles',
    guarded: 'jared',
    eyebrow: 'Jared profiles',
    title: 'Profile CMS routing starts here.',
    description: 'A guarded placeholder for listing active, paused, draft, and archived Jared profiles.',
    note: 'Task 8 owns the real CMS and uploader UI.'
  },
  {
    path: '/jared/profiles/new',
    guarded: 'jared',
    eyebrow: 'New Jared profile',
    title: 'A create-profile route is reserved.',
    description: 'A guarded placeholder for future Jared profile creation.',
    note: 'No form or upload UI is implemented yet.'
  },
  {
    path: '/jared/profiles/:id',
    guarded: 'jared',
    eyebrow: 'Edit Jared profile',
    title: 'A single CMS edit route is reserved.',
    description: 'A guarded dynamic placeholder aligned to the CMS schema.',
    note: 'The display name remains schema-editable, but UI is deferred.'
  },
  {
    path: '/jared/demo',
    guarded: 'jared',
    eyebrow: 'Demo',
    title: 'Demo mode has a guarded destination.',
    description: 'A placeholder for local-only demo flow controls.',
    note: 'Task 9 owns the demo experience; this task only provides write guards.'
  },
  {
    path: '/jared/settings',
    guarded: 'jared',
    eyebrow: 'Jared settings',
    title: 'Jared settings route is protected.',
    description: 'A placeholder for account-level controls specific to Jared.',
    note: 'No settings forms are implemented yet.'
  }
];

export function renderConfiguredRoute(config: RouteConfig) {
  const page = <PlaceholderPage {...config} />;

  if (config.guarded === 'jared') {
    return <JaredRouteGuard>{page}</JaredRouteGuard>;
  }

  if (config.guarded === 'auth') {
    return <AuthGate>{page}</AuthGate>;
  }

  return page;
}
