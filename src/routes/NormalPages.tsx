import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChatThread } from '../components/messages/ChatThread';
import { MatchModal } from '../components/normal/MatchModal';
import { PendingState } from '../components/normal/PendingState';
import { ProfileDetailSheet } from '../components/normal/ProfileDetailSheet';
import { ProfileForm } from '../components/normal/ProfileForm';
import { SwipeDeck } from '../components/normal/SwipeDeck';
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
