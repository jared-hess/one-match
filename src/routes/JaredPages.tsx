import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { InboundLikeCard } from '../components/jared/InboundLikeCard';
import { InboundLikeDetail } from '../components/jared/InboundLikeDetail';
import { JaredHome } from '../components/jared/JaredHome';
import { RelationshipStatusBadge } from '../components/jared/RelationshipStatusBadge';
import { PageShell } from '../components/PageShell';
import { listAllJaredProfilesForJared } from '../lib/jaredProfiles';
import { addJaredNote, decideRelationship, fetchJaredInboundContext, fetchJaredInboundContexts, matchRelationshipBack } from '../lib/relationships';
import type { InboundRelationshipContext, JaredProfile, RelationshipStatus } from '../types';

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

export function JaredSettingsPage() {
  return (
    <PageShell eyebrow="Jared settings" title="Workspace settings are protected." description="Account-level controls for Jared stay behind the existing role guard.">
      <div className="space-y-3">
        <EmptyJaredState title="Route guard" description="This route renders only after profiles.role is confirmed as jared." />
        <EmptyJaredState title="Private boundaries" description="Inbound labels, relationship decisions, and notes remain unavailable from normal routes." />
      </div>
    </PageShell>
  );
}
