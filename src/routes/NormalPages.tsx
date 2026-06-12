import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChatThread } from '../components/messages/ChatThread';
import { MatchModal } from '../components/normal/MatchModal';
import { PendingState } from '../components/normal/PendingState';
import { ProfileDetailSheet } from '../components/normal/ProfileDetailSheet';
import { ProfileForm } from '../components/normal/ProfileForm';
import { SwipeDeck } from '../components/normal/SwipeDeck';
import { getCurrentUser, signOut } from '../lib/auth';
import { createOwnDeletionRequest, fetchOwnDeletionRequests } from '../lib/deletionRequests';
import { getVisibleJaredProfile, listActiveJaredProfiles } from '../lib/jaredProfiles';
import {
  fetchMessages,
  fetchNormalMessagingState,
  markReceivedMessagesRead,
  sendCurrentUserMessage,
  subscribeToConversationMessages,
  type NormalMessagingState
} from '../lib/messages';
import type { JaredProfile, Message } from '../types';
import { PageShell } from '../components/PageShell';

function PolicySection({ title, children }: { title: string; children: string }) {
  return (
    <section className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
      <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-merlot-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-ink-600">{children}</p>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <PageShell eyebrow="Privacy" title="Privacy Policy MVP" description="A plain-language summary of how DateJared handles account, profile, and deletion data for adults 18 and older.">
      <div className="space-y-4">
        <PolicySection title="Adults only">DateJared is for people who confirm they are 18 or older. Do not use the service if you are under 18.</PolicySection>
        <PolicySection title="Minimal data collection">We collect only the details needed for the MVP dating flow: Google sign-in identity, email, display name, age confirmation, general city, profile text, choices, matches, messages, and account safety records.</PolicySection>
        <PolicySection title="Location boundaries">DateJared asks for a general city only. It does not request precise location, background tracking, or live device location.</PolicySection>
        <PolicySection title="Private profiles">Normal user profiles are not public, searchable, or available for user-to-user discovery. Jared can review inbound interest and matched conversations inside guarded routes.</PolicySection>
        <PolicySection title="Photos and processors">Uploaded profile photos are handled as private account media. Google provides sign-in, and Supabase stores account, profile, relationship, message, photo, and deletion-request records for the service.</PolicySection>
        <PolicySection title="No sale of data">DateJared does not sell personal data. MVP data is used to run sign-in, profile completion, matching, messaging, moderation, safety, and deletion workflows.</PolicySection>
        <PolicySection title="Deletion process">Signed-in users can request account and data deletion from the delete-data route or settings. Jared can mark those requests requested, completed, or cancelled in the guarded workspace after review.</PolicySection>
      </div>
    </PageShell>
  );
}

export function TermsPage() {
  return (
    <PageShell eyebrow="Terms" title="Terms of Service MVP" description="Use DateJared respectfully, honestly, and only if you are an adult. This product copy is not legal advice.">
      <div className="space-y-4">
        <PolicySection title="Eligibility">You must be 18 or older and able to use this service responsibly. You agree not to misrepresent your age, identity, or intent.</PolicySection>
        <PolicySection title="Account conduct">Use respectful profile text, messages, and photos. Do not upload illegal, explicit, harassing, or non-consensual content.</PolicySection>
        <PolicySection title="No public directory">DateJared is a narrow, private dating experience. It does not provide public profile browsing, user-to-user search, or broad discovery between normal users.</PolicySection>
        <PolicySection title="Safety controls">Jared may review inbound interest, messages, and account signals to keep the experience safe, respond to deletion requests, and close access where needed.</PolicySection>
        <PolicySection title="Data deletion">You can request deletion of account and profile data from the delete-data route or settings after sign-in. Some records may need short retention for safety, abuse prevention, or operational integrity.</PolicySection>
      </div>
    </PageShell>
  );
}

export function LandingPage() {
  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">DateJared</p>
      <h1 className="mt-4 font-display text-6xl font-semibold leading-[0.88] tracking-[-0.06em] text-merlot-900">Dating, optimized.</h1>
      <p className="mt-5 text-base leading-7 text-ink-600">
        A focused discovery experience designed to reduce romantic decision fatigue.
      </p>
      <div className="mt-7 grid gap-3">
        <Link className="rounded-full bg-blush-500 px-5 py-3 text-center text-sm font-extrabold text-cream-50 shadow-glow" to="/onboarding">
          Start
        </Link>
        <Link className="rounded-full border border-blush-100 bg-cream-50/70 px-5 py-3 text-center text-sm font-extrabold text-merlot-900" to="/complete-profile">
          Sign In
        </Link>
      </div>
    </section>
  );
}

export function OnboardingPage() {
  const [checked, setChecked] = useState(false);

  return (
    <PageShell eyebrow="Onboarding" title="Start with the non-negotiable." description="DateJared is for adults. Confirm that first, then set a few preferences before browsing.">
      <label className="flex items-start gap-3 rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm font-bold text-ink-900">
        <input className="mt-1 h-4 w-4 accent-blush-500" checked={checked} onChange={(event) => setChecked(event.target.checked)} type="checkbox" />
        I confirm I am 18 or older.
      </label>
      <Link
        aria-disabled={!checked}
        className={`mt-5 inline-flex w-full justify-center rounded-full px-5 py-3 text-sm font-extrabold shadow-glow ${
          checked ? 'bg-blush-500 text-cream-50' : 'pointer-events-none bg-blush-100 text-ink-600'
        }`}
        to="/preferences"
      >
        Continue
      </Link>
    </PageShell>
  );
}

export function PreferencesPage() {
  return (
    <PageShell eyebrow="Preferences" title="Set the frame before the deck." description="These choices keep discovery focused. They are local for now and can be replayed with your profile later.">
      <form className="space-y-4">
        <label className="block text-sm font-bold text-ink-900">
          Age range
          <select className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" defaultValue="late-20s-30s">
            <option value="late-20s-30s">Late 20s to 30s</option>
            <option value="30s">30s</option>
            <option value="open">Open, but intentional</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Distance
          <select className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" defaultValue="local">
            <option value="local">Local to Oakland</option>
            <option value="bay-area">Bay Area</option>
            <option value="flexible">Flexible for the right fit</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Interested in
          <select className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" defaultValue="jared">
            <option value="men">Men</option>
            <option value="focused">Open to focused matches</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Relationship goal
          <select className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" defaultValue="serious">
            <option value="serious">Serious, paced, and mutual</option>
            <option value="conversation-first">Conversation first</option>
          </select>
        </label>
      </form>
      <p className="mt-5 rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">Preparing a serious, narrow deck. No endless browsing; just enough signal to choose well.</p>
      <Link className="mt-5 inline-flex w-full justify-center rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" to="/swipe">
        Open the deck
      </Link>
    </PageShell>
  );
}

export function SwipePage() {
  const [profiles, setProfiles] = useState<JaredProfile[]>([]);

  useEffect(() => {
    let mounted = true;
    listActiveJaredProfiles().then((nextProfiles) => {
      if (mounted) {
        setProfiles(nextProfiles);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!profiles.length) {
    return <PageShell eyebrow="Swipe" title="Preparing Jared profiles." description="The local fallback deck is loading safely." />;
  }

  return <SwipeDeck profiles={profiles} />;
}

export function ProfileDetailPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<JaredProfile | null>(null);

  useEffect(() => {
    let mounted = true;
    getVisibleJaredProfile(id ?? '').then((nextProfile) => {
      if (mounted) {
        setProfile(nextProfile);
      }
    });
    return () => {
      mounted = false;
    };
  }, [id]);

  if (!profile) {
    return <PageShell eyebrow="Profile" title="Profile not found." description="Return to the deck to choose an available Jared profile." />;
  }

  return <ProfileDetailSheet profile={profile} />;
}

export function CompleteProfilePage() {
  return <ProfileForm />;
}

export function PendingPage() {
  return <PendingState />;
}

export function MatchPage() {
  return <MatchModal />;
}

export function MessagesPage() {
  const [state, setState] = useState<NormalMessagingState | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeText, setRealtimeText] = useState('Refresh is available if live updates are unavailable.');

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const nextState = await fetchNormalMessagingState();
      setState(nextState);
      setMessages(nextState.state === 'ready' ? nextState.messages : []);
      if (nextState.state === 'ready') {
        void markReceivedMessagesRead(nextState.item.conversation.id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load your conversation.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchNormalMessagingState()
      .then((nextState) => {
        if (mounted) {
          setState(nextState);
          setMessages(nextState.state === 'ready' ? nextState.messages : []);
        }
        if (nextState.state === 'ready') {
          void markReceivedMessagesRead(nextState.item.conversation.id);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load your conversation.');
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (state?.state !== 'ready') {
      return;
    }

    const subscription = subscribeToConversationMessages(state.item.conversation.id, () => {
      fetchMessages(state.item.conversation.id).then(setMessages).catch(() => setRealtimeText('Live update arrived, but refresh failed. Use Refresh to retry.'));
    });
    Promise.resolve().then(() => {
      setRealtimeText(subscription.realtime ? 'Live updates are on for this conversation.' : `Live updates unavailable: ${subscription.reason}. Use Refresh to check for replies.`);
    });

    return subscription.unsubscribe;
  }, [state]);

  const conversation = state?.state === 'ready' ? state.item : null;
  const currentUserId = state?.currentUserId ?? null;
  const blockedDescription = state?.state === 'blocked' ? state.description : 'Messaging opens only after You and Jared matched.';

  async function handleSend(body: string) {
    if (!conversation) {
      return;
    }

    const result = await sendCurrentUserMessage(conversation.conversation.id, body);
    if (result.error) {
      setError(result.error.message);
      return;
    }
    await load(false);
  }

  return (
    <PageShell eyebrow="Messages" title="You and Jared matched" description="A private, matched-only thread. Pending likes and closed conversations stay non-interactive.">
      {loading ? <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm text-ink-600">Loading your conversation.</p> : null}
      {error ? <p className="mb-4 rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm font-bold text-merlot-900">{error}</p> : null}
      {!loading && state?.state === 'blocked' ? (
        <ChatThread
          conversation={null}
          currentUserId={currentUserId}
          disabledReason={blockedDescription}
          messages={[]}
          onRefresh={() => void load(false)}
          onSend={handleSend}
          statusText={blockedDescription}
        />
      ) : null}
      {conversation ? (
        <ChatThread
          conversation={conversation}
          currentUserId={currentUserId}
          disabledReason={blockedDescription}
          messages={messages}
          onRefresh={() => void load(false)}
          onSend={handleSend}
          statusText={realtimeText}
        />
      ) : null}
    </PageShell>
  );
}

export function DeleteDataPage() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);
  const [status, setStatus] = useState<string>('Checking sign-in status.');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    getCurrentUser()
      .then((user) => {
        if (mounted) {
          setSignedIn(Boolean(user));
          setStatus(user ? 'You can submit a deletion request for this signed-in account.' : 'Sign in with Google first so DateJared can connect the deletion request to the correct account.');
        }
      })
      .catch((caught) => {
        if (mounted) {
          setSignedIn(false);
          setStatus(caught instanceof Error ? caught.message : 'Sign-in status is unavailable.');
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleRequestDeletion() {
    setBusy(true);
    setStatus('Submitting your deletion request.');

    const result = await createOwnDeletionRequest();

    if (result.error) {
      setStatus(result.error.message);
    } else if (result.demoMode) {
      setStatus('Demo mode did not write a deletion request. End demo mode and sign in to submit one.');
    } else {
      setStatus('Deletion request submitted. Jared can review and mark it completed or cancelled from the guarded workspace.');
    }

    setBusy(false);
  }

  return (
    <PageShell eyebrow="Delete data" title="Request account and data deletion" description="Signed-in users can ask DateJared to delete account, profile, message, photo, and relationship data tied to their account.">
      <div className="space-y-4">
        <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">
          Anonymous visitors cannot create deletion requests because there is no verified account to delete. Sign in with Google, then return here or use Settings to submit the request.
        </p>
        <p className="rounded-3xl border border-blush-100 bg-white/70 p-4 text-sm font-bold leading-6 text-merlot-900" role="status">
          {status}
        </p>
        <button
          className="w-full rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow disabled:cursor-not-allowed disabled:bg-ink-200 disabled:text-ink-500"
          disabled={!signedIn || busy}
          onClick={() => void handleRequestDeletion()}
          type="button"
        >
          {busy ? 'Submitting request' : 'Request deletion'}
        </button>
        <Link className="inline-flex text-sm font-bold text-blush-600" to="/privacy">
          Read the privacy policy
        </Link>
      </div>
    </PageShell>
  );
}

export function SettingsPage() {
  const [requests, setRequests] = useState<Array<{ id: string; status: string; requested_at: string }>>([]);
  const [status, setStatus] = useState<string>('Loading account controls.');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const nextRequests = await fetchOwnDeletionRequests();
      setRequests(nextRequests.map((request) => ({ id: request.id, status: request.status, requested_at: request.requested_at })));
      setStatus(nextRequests.length ? 'Deletion request history loaded.' : 'No deletion request is currently on file for this account.');
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Unable to load settings.');
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => void load());
  }, [load]);

  async function handleRequestDeletion() {
    setBusy(true);
    setStatus('Submitting your deletion request.');
    const result = await createOwnDeletionRequest();

    if (result.error) {
      setStatus(result.error.message);
    } else {
      setStatus('Deletion request submitted.');
      await load();
    }

    setBusy(false);
  }

  async function handleSignOut() {
    setBusy(true);
    await signOut();
    setStatus('Signed out.');
    setBusy(false);
  }

  return (
    <PageShell eyebrow="Settings" title="Account and safety controls" description="Manage normal-user account boundaries, deletion requests, and sign-out from one protected place.">
      <div className="space-y-4">
        <section className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-merlot-900">Safety boundaries</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600">Your profile is not public, normal users cannot browse each other, and DateJared asks for general city rather than precise location.</p>
        </section>
        <section className="rounded-3xl border border-blush-100 bg-white/70 p-4">
          <h2 className="font-display text-2xl font-semibold tracking-[-0.03em] text-merlot-900">Delete data</h2>
          <p className="mt-2 text-sm leading-6 text-ink-600" role="status">{status}</p>
          <button className="mt-4 w-full rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow disabled:bg-ink-200" disabled={busy} onClick={() => void handleRequestDeletion()} type="button">
            Request account deletion
          </button>
          {requests.length ? (
            <ul className="mt-4 space-y-2">
              {requests.map((request) => (
                <li className="rounded-2xl border border-blush-100 bg-cream-50/80 p-3 text-sm text-ink-600" key={request.id}>
                  <span className="font-bold text-merlot-900">{request.status}</span> · requested {new Date(request.requested_at).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : null}
        </section>
        <button className="w-full rounded-full border border-blush-100 bg-cream-50/70 px-5 py-3 text-sm font-extrabold text-merlot-900" disabled={busy} onClick={() => void handleSignOut()} type="button">
          Sign out
        </button>
      </div>
    </PageShell>
  );
}
