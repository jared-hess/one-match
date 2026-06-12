import type { ReactNode } from 'react';
import { AuthGate } from '../components/AuthGate';
import { JaredRouteGuard } from '../components/JaredRouteGuard';
import { PlaceholderPage, type PlaceholderPageProps } from './PlaceholderPage';
import {
  CompleteProfilePage,
  DeleteDataPage,
  LandingPage,
  MatchPage,
  MessagesPage,
  OnboardingPage,
  PendingPage,
  PreferencesPage,
  PrivacyPage,
  ProfileDetailPage,
  SettingsPage,
  SwipePage,
  TermsPage
} from './NormalPages';
import {
  JaredDemoPage,
  JaredHomePage,
  JaredInboundDetailPage,
  JaredInboundPage,
  JaredMatchesPage,
  JaredMessagesDetailPage,
  JaredMessagesPage,
  JaredProfileEditPage,
  JaredProfileNewPage,
  JaredProfilesPage,
  JaredSettingsPage
} from './JaredPages';

type RouteConfig = PlaceholderPageProps & {
  path: string;
  guarded?: 'auth' | 'jared';
  element?: ReactNode;
};

export const normalRouteConfigs: RouteConfig[] = [
  {
    path: '/',
    eyebrow: 'Welcome',
    title: 'Dating, optimized.',
    description: 'A focused discovery experience designed to reduce romantic decision fatigue.',
    note: 'Start the normal DateJared flow without sign-in.',
    element: <LandingPage />
  },
  {
    path: '/onboarding',
    eyebrow: 'Onboarding',
    title: 'Start with age confirmation.',
    description: 'Anonymous-capable age gate.',
    note: 'Continue only after confirming 18+.',
    element: <OnboardingPage />
  },
  {
    path: '/preferences',
    eyebrow: 'Preferences',
    title: 'Set the frame before the deck.',
    description: 'Anonymous-capable preference controls.',
    note: 'Preferences stay local until profile completion.',
    element: <PreferencesPage />
  },
  {
    path: '/swipe',
    eyebrow: 'Swipe',
    title: 'Choose deliberately.',
    description: 'Swipe cards render without sign-in.',
    note: 'Anonymous likes stay queued locally.',
    element: <SwipePage />
  },
  {
    path: '/profile/:id',
    eyebrow: 'Profile',
    title: 'Jared profile detail.',
    description: 'Anonymous-capable detail route.',
    note: 'Internal labels stay hidden.',
    element: <ProfileDetailPage />
  },
  {
    path: '/complete-profile',
    eyebrow: 'Complete profile',
    title: 'Tell Jared enough to respond seriously.',
    description: 'Profile completion requires display name, age confirmation, and city.',
    note: 'Replay queued likes only after auth and successful profile save.',
    element: <CompleteProfilePage />
  },
  {
    path: '/pending',
    eyebrow: 'Pending',
    title: 'Your interest is pending.',
    description: 'Like sent; messaging if Jared matches back.',
    note: 'No chat opens from a one-sided like.',
    element: <PendingPage />
  },
  {
    path: '/match',
    eyebrow: 'Match',
    title: 'It’s a Match.',
    description: 'You and Jared have both expressed interest.',
    note: 'Messaging remains deferred.',
    element: <MatchPage />
  },
  {
    path: '/messages',
    guarded: 'auth',
    eyebrow: 'Messages',
    title: 'You and Jared matched.',
    description: 'Matched-only messaging for an open Jared conversation.',
    note: 'Pending likes stay non-interactive; Realtime falls back to manual refresh.',
    element: <MessagesPage />
  },
  {
    path: '/settings',
    guarded: 'auth',
    eyebrow: 'Settings',
    title: 'Account and safety controls.',
    description: 'Protected normal-user settings for privacy boundaries, deletion requests, and sign-out.',
    note: 'Deletion requests use the shared data layer and remain tied to the signed-in account.',
    element: <SettingsPage />
  },
  {
    path: '/privacy',
    eyebrow: 'Privacy',
    title: 'Privacy Policy MVP.',
    description: 'Plain-language privacy copy for DateJared adults-only account, profile, and deletion data.',
    note: 'This copy is not legal advice.',
    element: <PrivacyPage />
  },
  {
    path: '/terms',
    eyebrow: 'Terms',
    title: 'Terms of Service MVP.',
    description: 'Plain-language expectations for adults-only account use, safety, and deletion requests.',
    note: 'This copy is not legal advice.',
    element: <TermsPage />
  },
  {
    path: '/delete-data',
    eyebrow: 'Delete data',
    title: 'Request account and data deletion.',
    description: 'Signed-in users can submit deletion requests; anonymous visitors get clear sign-in guidance.',
    note: 'Requests move through requested, completed, and cancelled states.',
    element: <DeleteDataPage />
  }
];

export const jaredRouteConfigs: RouteConfig[] = [
  {
    path: '/jared',
    guarded: 'jared',
    eyebrow: 'Jared workspace',
    title: 'A private control room for Jared.',
    description: 'The guarded Jared landing route is present without exposing workflows to normal users.',
    note: 'Inbound review, decisions, CMS, messages, settings, and demo controls are only placeholders.',
    element: <JaredHomePage />
  },
  {
    path: '/jared/inbound',
    guarded: 'jared',
    eyebrow: 'Inbound',
    title: 'Inbound interest will queue here.',
    description: 'A guarded placeholder for Jared to review pending relationships.',
    note: 'Task 6 owns the actual inbound business UI.',
    element: <JaredInboundPage />
  },
  {
    path: '/jared/inbound/:id',
    guarded: 'jared',
    eyebrow: 'Inbound detail',
    title: 'A single inbound relationship route is reserved.',
    description: 'A guarded dynamic placeholder for reviewing one interested user.',
    note: 'Relationship decision helpers exist in src/lib/relationships.ts; UI comes later.',
    element: <JaredInboundDetailPage />
  },
  {
    path: '/jared/matches',
    guarded: 'jared',
    eyebrow: 'Matches',
    title: 'Jared match management has a guarded path.',
    description: 'A placeholder for matched and archived relationship states.',
    note: 'No match management table or workflow is implemented yet.',
    element: <JaredMatchesPage />
  },
  {
    path: '/jared/messages',
    guarded: 'jared',
    eyebrow: 'Jared messages',
    title: 'Jared message inbox.',
    description: 'Open, matched conversations only.',
    note: 'Pending and archived relationships never unlock replies.',
    element: <JaredMessagesPage />
  },
  {
    path: '/jared/messages/:id',
    guarded: 'jared',
    eyebrow: 'Jared message detail',
    title: 'Reply to a matched conversation.',
    description: 'Jared can reply only through the gated data layer.',
    note: 'Realtime falls back to refresh when unavailable.',
    element: <JaredMessagesDetailPage />
  },
  {
    path: '/jared/profiles',
    guarded: 'jared',
    eyebrow: 'Jared profiles',
    title: 'Manage Jared profile cards.',
    description: 'List active, paused, draft, and archived Jared profiles.',
    note: 'CMS controls stay private to Jared.',
    element: <JaredProfilesPage />
  },
  {
    path: '/jared/profiles/new',
    guarded: 'jared',
    eyebrow: 'New Jared profile',
    title: 'Create a profile card.',
    description: 'A guarded form for profile creation.',
    note: 'Writes are centralized in src/lib/jaredProfiles.ts.',
    element: <JaredProfileNewPage />
  },
  {
    path: '/jared/profiles/:id',
    guarded: 'jared',
    eyebrow: 'Edit Jared profile',
    title: 'Edit a profile card.',
    description: 'A guarded editor aligned to the CMS schema.',
    note: 'Preview uses the normal SwipeCard surface.',
    element: <JaredProfileEditPage />
  },
  {
    path: '/jared/demo',
    guarded: 'jared',
    eyebrow: 'Demo',
    title: 'Demo mode has a guarded destination.',
    description: 'A local-only demo flow for Jared.',
    note: 'Demo state stays isolated from normal swipe queues.',
    element: <JaredDemoPage />
  },
  {
    path: '/jared/settings',
    guarded: 'jared',
    eyebrow: 'Jared settings',
    title: 'Workspace safety controls.',
    description: 'Guarded Jared controls for reviewing account deletion requests.',
    note: 'Deletion request statuses stay limited to requested, completed, and cancelled.',
    element: <JaredSettingsPage />
  }
];

export function renderConfiguredRoute(config: RouteConfig) {
  const page = config.element ?? <PlaceholderPage {...config} />;

  if (config.guarded === 'jared') {
    return <JaredRouteGuard>{page}</JaredRouteGuard>;
  }

  if (config.guarded === 'auth') {
    return <AuthGate>{page}</AuthGate>;
  }

  return page;
}
