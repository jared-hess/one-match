import type { ReactNode } from 'react';
import { AuthGate } from '../components/AuthGate';
import { JaredRouteGuard } from '../components/JaredRouteGuard';
import { PlaceholderPage, type PlaceholderPageProps } from './PlaceholderPage';
import {
  CompleteProfilePage,
  LandingPage,
  MatchPage,
  MessagesPage,
  OnboardingPage,
  PendingPage,
  PreferencesPage,
  ProfileDetailPage,
  SwipePage
} from './NormalPages';
import { JaredHomePage, JaredInboundDetailPage, JaredInboundPage, JaredMatchesPage, JaredMessagesDetailPage, JaredMessagesPage, JaredSettingsPage } from './JaredPages';

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
    note: 'No settings forms are implemented yet.',
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
