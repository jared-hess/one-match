import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { DemoLauncher } from '../components/demo/DemoLauncher';
import { DemoSwipeFlow } from '../components/demo/DemoSwipeFlow';
import { InboundLikeCard } from '../components/jared/InboundLikeCard';
import { InboundLikeDetail } from '../components/jared/InboundLikeDetail';
import { JaredHome } from '../components/jared/JaredHome';
import { JaredProfileForm } from '../components/jared/JaredProfileForm';
import { JaredProfileList } from '../components/jared/JaredProfileList';
import { RelationshipStatusBadge } from '../components/jared/RelationshipStatusBadge';
import { ChatThread } from '../components/messages/ChatThread';
import { ConversationList } from '../components/messages/ConversationList';
import { PageShell } from '../components/PageShell';
import {
  buildJaredDemoDeck,
  DEMO_DECK_SIZES,
  endJaredDemoMode,
  getDemoEligibleJaredProfiles,
  getJaredDemoState,
  resetJaredDemoState,
  type DemoDeckSize,
  type JaredDemoState
} from '../lib/demoMode';
import { fetchDeletionRequestsForJared, updateDeletionRequestForJared } from '../lib/deletionRequests';
import {
  archiveJaredProfile,
  createJaredProfile,
  getJaredProfileForJared,
  listAllJaredProfilesForJared,
  updateJaredProfile,
  updateJaredProfileSortOrder
} from '../lib/jaredProfiles';
import {
  fetchJaredMessagingConversation,
  fetchJaredMessagingConversations,
  fetchMessages,
  markReceivedMessagesRead,
  sendCurrentUserMessage,
  subscribeToConversationMessages,
  type MessagingConversation
} from '../lib/messages';
import { addJaredNote, decideRelationship, fetchJaredInboundContext, fetchJaredInboundContexts, matchRelationshipBack } from '../lib/relationships';
import type { DeletionRequest, DeletionRequestStatus, InboundRelationshipContext, JaredProfile, JaredProfileInsert, JaredProfileUpdate, Message, RelationshipStatus } from '../types';

type DemoStage = 'launch' | 'swiping' | 'complete';

function useJaredContexts(status?: RelationshipStatus) {
  const [contexts, setContexts] = useState<InboundRelationshipContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      setContexts(await fetchJaredInboundContexts(status));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load Jared relationship context.');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let mounted = true;

    fetchJaredInboundContexts(status)
      .then((nextContexts) => {
        if (mounted) {
          setContexts(nextContexts);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load Jared relationship context.');
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
  }, [status]);

  return { contexts, loading, error, reload: load };
}

function EmptyJaredState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-5 text-sm leading-6 text-ink-600">
      <p className="font-bold text-ink-900">{title}</p>
      <p className="mt-2">{description}</p>
    </div>
  );
}

export function JaredHomePage() {
  const pending = useJaredContexts('pending');
  const matched = useJaredContexts('matched');
  const [activeProfiles, setActiveProfiles] = useState<JaredProfile[]>([]);

  useEffect(() => {
    let mounted = true;

    listAllJaredProfilesForJared()
      .then((profiles) => {
        if (mounted) {
          setActiveProfiles(profiles.filter((profile) => profile.active && !profile.archived));
        }
      })
      .catch(() => {
        if (mounted) {
          setActiveProfiles([]);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  return <JaredHome activeProfiles={activeProfiles} matchedContexts={matched.contexts} pendingContexts={pending.contexts} />;
}

export function JaredInboundPage() {
  const { contexts, loading, error } = useJaredContexts('pending');

  return (
    <PageShell eyebrow="Inbound" title="Review the people who liked Jared." description="Pending relationships show Jared-only labels, profile context, timestamps, and private-note counts.">
      <div className="space-y-4">
        {loading ? <EmptyJaredState title="Loading inbound likes" description="Checking the protected relationship queue." /> : null}
        {error ? <EmptyJaredState title="Inbound unavailable" description={error} /> : null}
        {!loading && !error && !contexts.length ? <EmptyJaredState title="No pending likes" description="Supabase may be unavailable or every inbound relationship has already been decided." /> : null}
        {contexts.map((context) => (
          <InboundLikeCard context={context} key={context.relationship.id} />
        ))}
      </div>
    </PageShell>
  );
}

export function JaredInboundDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [context, setContext] = useState<InboundRelationshipContext | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Choose Match Back, Pass, or Archive when ready.');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (!id) {
      setError('Missing relationship id.');
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      setContext(await fetchJaredInboundContext(id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load this inbound like.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      Promise.resolve().then(() => {
        if (mounted) {
          setLoading(false);
          setError('Missing relationship id.');
        }
      });
      return () => {
        mounted = false;
      };
    }

    fetchJaredInboundContext(id)
      .then((nextContext) => {
        if (mounted) {
          setContext(nextContext);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load this inbound like.');
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
  }, [id]);

  async function handleDecision(decision: Exclude<RelationshipStatus, 'pending'>) {
    if (!id) {
      return;
    }

    setStatus('Saving Jared decision…');
    const result = decision === 'matched' ? await matchRelationshipBack(id) : await decideRelationship(id, decision);

    if (result.error) {
      setStatus(result.error.message);
      return;
    }

    setStatus(decision === 'matched' ? 'Matched and conversation opened.' : `Relationship marked ${decision}.`);
    await load();

    if (decision !== 'matched') {
      navigate('/jared/inbound');
    }
  }

  async function handleAddNote(note: string): Promise<string | null> {
    if (!id) {
      return 'Missing relationship id.';
    }

    const result = await addJaredNote(id, note);

    if (result.error) {
      return result.error.message;
    }

    await load();
    return null;
  }

  if (loading) {
    return <PageShell eyebrow="Inbound detail" title="Loading this inbound like." description="Fetching protected Jared context." />;
  }

  if (error || !context) {
    return (
      <PageShell eyebrow="Inbound detail" title="This inbound like is unavailable." description={error ?? 'No relationship matched this id.'}>
        <Link className="rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" to="/jared/inbound">Back to inbound</Link>
      </PageShell>
    );
  }

  return <InboundLikeDetail context={context} decisionStatus={status} onAddNote={handleAddNote} onDecide={handleDecision} />;
}

export function JaredMatchesPage() {
  const { contexts, loading, error } = useJaredContexts('matched');

  return (
    <PageShell eyebrow="Matches" title="Matched conversations are ready." description="This list shows match state with last-message and unread placeholders only; full messaging belongs to Task 7.">
      <div className="space-y-4">
        {loading ? <EmptyJaredState title="Loading matches" description="Checking matched relationships." /> : null}
        {error ? <EmptyJaredState title="Matches unavailable" description={error} /> : null}
        {!loading && !error && !contexts.length ? <EmptyJaredState title="No active matches" description="Match Back from inbound likes to open a conversation placeholder." /> : null}
        {contexts.map((context) => (
          <article className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl" key={context.relationship.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Matched user</p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">{context.userProfile?.display_name ?? 'Unknown user'}</h2>
                <p className="mt-2 text-sm text-ink-600">{context.userProfile?.city ?? 'City not shared'}</p>
              </div>
              <RelationshipStatusBadge status={context.relationship.status} />
            </div>
            <p className="mt-5 rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">Last-message placeholder: {context.latestMessage?.body ?? 'No messages yet.'}</p>
            <p className="mt-3 text-sm font-bold text-blush-600">Unread placeholder: none calculated until Task 7.</p>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

export function JaredMessagesPage() {
  const [conversations, setConversations] = useState<MessagingConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      setConversations(await fetchJaredMessagingConversations());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load Jared conversations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    fetchJaredMessagingConversations()
      .then((nextConversations) => {
        if (mounted) {
          setConversations(nextConversations);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load Jared conversations.');
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

  return (
    <PageShell eyebrow="Jared messages" title="Reply only where the match is mutual." description="Jared sees open conversations created by the matched relationship contract—never pending likes or user-to-user threads.">
      <div className="space-y-4">
        {loading ? <EmptyJaredState title="Loading conversations" description="Checking open matched conversations." /> : null}
        {error ? <EmptyJaredState title="Messages unavailable" description={error} /> : null}
        <ConversationList basePath="/jared/messages" conversations={conversations} />
        <button className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-blush-600" onClick={() => void load(false)} type="button">
          Refresh inbox
        </button>
      </div>
    </PageShell>
  );
}

export function JaredMessagesDetailPage() {
  const { id } = useParams();
  const [conversation, setConversation] = useState<MessagingConversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeText, setRealtimeText] = useState('Refresh is available if live updates are unavailable.');

  const load = useCallback(async (showLoading = true) => {
    if (!id) {
      setError('Missing conversation id.');
      setLoading(false);
      return;
    }

    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      const nextConversation = await fetchJaredMessagingConversation(id);
      setConversation(nextConversation);
      setMessages(nextConversation ? await fetchMessages(nextConversation.conversation.id) : []);
      if (nextConversation) {
        void markReceivedMessagesRead(nextConversation.conversation.id);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load this conversation.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      Promise.resolve().then(() => {
        if (mounted) {
          setError('Missing conversation id.');
          setLoading(false);
        }
      });
      return () => {
        mounted = false;
      };
    }

    fetchJaredMessagingConversation(id)
      .then(async (nextConversation) => {
        const nextMessages = nextConversation ? await fetchMessages(nextConversation.conversation.id) : [];
        if (mounted) {
          setConversation(nextConversation);
          setMessages(nextMessages);
        }
        if (nextConversation) {
          void markReceivedMessagesRead(nextConversation.conversation.id);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load this conversation.');
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
  }, [id]);

  useEffect(() => {
    if (!conversation) {
      return;
    }

    const subscription = subscribeToConversationMessages(conversation.conversation.id, () => {
      fetchMessages(conversation.conversation.id).then(setMessages).catch(() => setRealtimeText('Live update arrived, but refresh failed. Use Refresh to retry.'));
    });
    Promise.resolve().then(() => {
      setRealtimeText(subscription.realtime ? 'Live updates are on for this conversation.' : `Live updates unavailable: ${subscription.reason}. Use Refresh to check for replies.`);
    });

    return subscription.unsubscribe;
  }, [conversation]);

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
    <PageShell eyebrow="Jared message detail" title="You and Jared matched" description="Jared replies only through the same matched/open conversation gate normal users use.">
      {loading ? <EmptyJaredState title="Loading conversation" description="Checking relationship and conversation status before enabling replies." /> : null}
      {error ? <EmptyJaredState title="Message thread unavailable" description={error} /> : null}
      {!loading && !conversation ? <EmptyJaredState title="Start the conversation" description="No matched open conversation was found for this route." /> : null}
      {conversation ? (
        <ChatThread
          conversation={conversation}
          currentUserId={conversation.conversation.jared_user_id}
          disabledReason="Jared replies only when the relationship is matched and the conversation is open."
          messages={messages}
          onRefresh={() => void load(false)}
          onSend={handleSend}
          statusText={realtimeText}
        />
      ) : null}
    </PageShell>
  );
}

export function JaredProfilesPage() {
  const [profiles, setProfiles] = useState<JaredProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (showLoading = true) => {
    if (showLoading) {
      setLoading(true);
    }
    setError(null);

    try {
      setProfiles(await listAllJaredProfilesForJared());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load Jared profiles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    listAllJaredProfilesForJared()
      .then((nextProfiles) => {
        if (mounted) {
          setProfiles(nextProfiles);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load Jared profiles.');
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

  async function handleMutation(action: () => Promise<{ error: Error | null; demoMode: boolean }>, fallbackStatus: string) {
    setStatus(null);
    const result = await action();

    if (result.error) {
      setStatus(result.error.message);
      return;
    }

    setStatus(result.demoMode ? 'Demo mode: write skipped safely.' : fallbackStatus);
    await load(false);
  }

  return (
    <PageShell eyebrow="Jared profiles" title="Manage the swipe-deck versions of Jared." description="Create, pause, archive, reorder, and preview profiles without exposing CMS labels to normal users.">
      <div className="mb-5 flex flex-wrap gap-3">
        <Link className="rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" to="/jared/profiles/new">
          New profile
        </Link>
        <button className="rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900" onClick={() => void load(false)} type="button">
          Refresh
        </button>
      </div>
      {loading ? <EmptyJaredState title="Loading profiles" description="Checking the live CMS table for Jared profile rows." /> : null}
      {error ? <EmptyJaredState title="Profiles unavailable" description={error} /> : null}
      {status ? <EmptyJaredState title="Profile update" description={status} /> : null}
      <JaredProfileList
        onArchive={(profile) => void handleMutation(() => archiveJaredProfile(profile.id), 'Profile archived without hard-deleting it.')}
        onMove={(profile, direction) => void handleMutation(() => updateJaredProfileSortOrder(profiles, profile.id, direction), 'Profile sort order updated.')}
        onToggleActive={(profile) => void handleMutation(() => updateJaredProfile(profile.id, { active: !profile.active, archived: profile.archived && !profile.active ? false : profile.archived }), 'Profile active state updated.')}
        onToggleDemo={(profile) => void handleMutation(() => updateJaredProfile(profile.id, { demo_eligible: !profile.demo_eligible }), 'Profile demo eligibility updated.')}
        profiles={profiles}
      />
    </PageShell>
  );
}

export function JaredProfileNewPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<string | null>(null);

  async function handleCreate(input: JaredProfileInsert | JaredProfileUpdate) {
    setStatus(null);
    const result = await createJaredProfile(input as JaredProfileInsert);

    if (result.error) {
      setStatus(result.error.message);
      return;
    }

    if (result.demoMode) {
      setStatus('Demo mode: create skipped safely.');
      return;
    }

    navigate(result.data ? `/jared/profiles/${result.data.id}` : '/jared/profiles');
  }

  return (
    <PageShell eyebrow="New Jared profile" title="Create a new profile card." description="Draft profiles can stay inactive until Jared is ready to add them to the normal swipe deck.">
      {status ? <EmptyJaredState title="Create unavailable" description={status} /> : null}
      <JaredProfileForm onSubmit={handleCreate} profile={null} />
    </PageShell>
  );
}

export function JaredProfileEditPage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<JaredProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Missing profile id.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      setProfile(await getJaredProfileForJared(id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load this Jared profile.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    let mounted = true;

    if (!id) {
      Promise.resolve().then(() => {
        if (mounted) {
          setError('Missing profile id.');
          setLoading(false);
        }
      });

      return () => {
        mounted = false;
      };
    }

    getJaredProfileForJared(id)
      .then((nextProfile) => {
        if (mounted) {
          setProfile(nextProfile);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load this Jared profile.');
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
  }, [id]);

  async function handleUpdate(input: JaredProfileInsert | JaredProfileUpdate) {
    if (!profile) {
      setStatus('Profile is not loaded yet.');
      return;
    }

    setStatus(null);
    const result = await updateJaredProfile(profile.id, input);

    if (result.error) {
      setStatus(result.error.message);
      return;
    }

    if (result.demoMode) {
      setStatus('Demo mode: update skipped safely.');
      return;
    }

    setStatus('Profile saved.');
    await load();
  }

  return (
    <PageShell eyebrow="Edit Jared profile" title="Tune one Jared profile." description="Profile edits stay in the data layer, and the preview uses the same surface normal users see.">
      <div className="mb-5 flex flex-wrap gap-3">
        <Link className="rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900" to="/jared/profiles">
          Back to profiles
        </Link>
      </div>
      {loading ? <EmptyJaredState title="Loading profile" description="Fetching the CMS row before opening the editor." /> : null}
      {error ? <EmptyJaredState title="Profile unavailable" description={error} /> : null}
      {status ? <EmptyJaredState title="Profile save" description={status} /> : null}
      {!loading && !profile ? <EmptyJaredState title="Profile not found" description="No Jared profile matched this id or slug." /> : null}
      {profile ? <JaredProfileForm onSubmit={handleUpdate} profile={profile} /> : null}
    </PageShell>
  );
}

export function JaredDemoPage() {
  const [profiles, setProfiles] = useState<JaredProfile[]>([]);
  const [demoState, setDemoState] = useState<JaredDemoState>(() => getJaredDemoState());
  const [stage, setStage] = useState<DemoStage>('launch');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);
  const [shareStatus, setShareStatus] = useState('Share is available when this device supports native or web sharing.');

  const demoProfiles = buildJaredDemoDeck(profiles, demoState.deckSize);
  const eligibleCount = getDemoEligibleJaredProfiles(profiles).length || getDemoEligibleJaredProfiles([]).length;

  useEffect(() => {
    let mounted = true;

    listAllJaredProfilesForJared()
      .then((nextProfiles) => {
        if (mounted) {
          setProfiles(nextProfiles);
        }
      })
      .catch((caught) => {
        if (mounted) {
          setError(caught instanceof Error ? caught.message : 'Unable to load Jared demo profiles.');
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
    let mounted = true;

    async function detectShareCapability() {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        setCanShare(true);
        setShareStatus('Share Link is ready for web share.');
        return;
      }

      try {
        const { Share } = await import('@capacitor/share');
        const result = await Share.canShare();
        if (mounted && result.value) {
          setCanShare(true);
          setShareStatus('Share Link is ready for Capacitor Share.');
        }
      } catch {
        if (mounted) {
          setShareStatus('Share Link is unavailable in this browser. Copy /jared/demo manually if needed.');
        }
      }
    }

    void detectShareCapability();

    return () => {
      mounted = false;
    };
  }, []);

  function handleDeckSizeChange(deckSize: DemoDeckSize) {
    const nextState = resetJaredDemoState(deckSize);
    setDemoState(nextState);
    setStage('launch');
  }

  function handleStart() {
    const nextState = resetJaredDemoState(demoState.deckSize);
    setDemoState(nextState);
    setStage('swiping');
  }

  function handleEndDemo() {
    const nextState = endJaredDemoMode();
    setDemoState(nextState);
    setStage('launch');
  }

  async function handleShare() {
    const url = typeof window === 'undefined' ? '/jared/demo' : `${window.location.origin}/jared/demo`;
    const shareData = {
      title: 'DateJared demo',
      text: 'Open the guarded local-only DateJared demo.',
      url
    };

    try {
      if (typeof navigator !== 'undefined' && 'share' in navigator) {
        await navigator.share(shareData);
        setShareStatus('Demo link shared.');
        return;
      }

      const { Share } = await import('@capacitor/share');
      await Share.share(shareData);
      setShareStatus('Demo link shared.');
    } catch {
      setShareStatus('Share was cancelled or unavailable. No demo data was written.');
    }
  }

  if (stage === 'complete') {
    return <DemoSwipeFlow canShare={canShare} onComplete={() => undefined} onEndDemo={handleEndDemo} onShare={() => void handleShare()} profiles={[]} shareStatus={shareStatus} state={demoState} />;
  }

  return (
    <div className="space-y-5">
      {loading ? <EmptyJaredState title="Loading demo profiles" description="Checking Jared profile rows before falling back to local demo seed data." /> : null}
      {error ? <EmptyJaredState title="Demo profiles fallback active" description={error} /> : null}
      {stage === 'launch' ? (
        <DemoLauncher availableProfiles={eligibleCount} deckSize={demoState.deckSize} onDeckSizeChange={handleDeckSizeChange} onStart={handleStart} />
      ) : (
        <DemoSwipeFlow
          canShare={canShare}
          onComplete={() => setStage('complete')}
          onEndDemo={handleEndDemo}
          onShare={() => void handleShare()}
          profiles={demoProfiles.length ? demoProfiles : buildJaredDemoDeck([], DEMO_DECK_SIZES[0])}
          shareStatus={shareStatus}
          state={demoState}
        />
      )}
    </div>
  );
}

export function JaredSettingsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setStatus(null);

    try {
      setRequests(await fetchDeletionRequestsForJared());
    } catch (caught) {
      setStatus(caught instanceof Error ? caught.message : 'Unable to load deletion requests.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => void load());
  }, [load]);

  async function handleStatusChange(id: string, nextStatus: DeletionRequestStatus) {
    setStatus(`Marking request ${nextStatus}.`);
    const result = await updateDeletionRequestForJared(id, { status: nextStatus });

    if (result.error) {
      setStatus(result.error.message);
      return;
    }

    if (result.demoMode) {
      setStatus('Demo mode did not update the deletion request. End demo mode before changing request status.');
      return;
    }

    setStatus(`Deletion request marked ${nextStatus}.`);
    await load();
  }

  return (
    <PageShell eyebrow="Jared settings" title="Workspace safety controls" description="Account-level controls for Jared stay behind the existing role guard, including deletion request review.">
      <div className="space-y-4">
        <EmptyJaredState title="Route guard" description="This route renders only after profiles.role is confirmed as jared." />
        {loading ? <EmptyJaredState title="Loading deletion requests" description="Checking requested, completed, and cancelled account deletion records." /> : null}
        {status ? <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm font-bold text-merlot-900" role="status">{status}</p> : null}
        {!loading && !requests.length ? <EmptyJaredState title="No deletion requests" description="Signed-in user deletion requests will appear here after submission." /> : null}
        {requests.map((request) => (
          <article className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl" key={request.id}>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Deletion request</p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">{request.status}</h2>
                <p className="mt-2 text-sm leading-6 text-ink-600">User id: {request.user_id}</p>
                <p className="text-sm leading-6 text-ink-600">Requested: {new Date(request.requested_at).toLocaleString()}</p>
                {request.completed_at ? <p className="text-sm leading-6 text-ink-600">Completed: {new Date(request.completed_at).toLocaleString()}</p> : null}
                {request.cancelled_at ? <p className="text-sm leading-6 text-ink-600">Cancelled: {new Date(request.cancelled_at).toLocaleString()}</p> : null}
              </div>
              <div className="grid gap-2 sm:min-w-40">
                {(['requested', 'completed', 'cancelled'] as const).map((nextStatus) => (
                  <button
                    className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-merlot-900 disabled:bg-blush-100 disabled:text-ink-500"
                    disabled={request.status === nextStatus}
                    key={nextStatus}
                    onClick={() => void handleStatusChange(request.id, nextStatus)}
                    type="button"
                  >
                    Mark {nextStatus}
                  </button>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}
