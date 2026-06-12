import { isProfileCompleteForJared } from '../../lib/relationships';
import type { InboundRelationshipContext, RelationshipStatus } from '../../types';
import { PrivateNotesPanel } from './PrivateNotesPanel';
import { RelationshipStatusBadge } from './RelationshipStatusBadge';

type InboundLikeDetailProps = {
  context: InboundRelationshipContext;
  decisionStatus: string;
  onDecide: (status: Exclude<RelationshipStatus, 'pending'>) => Promise<void>;
  onAddNote: (note: string) => Promise<string | null>;
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function InboundLikeDetail({ context, decisionStatus, onDecide, onAddNote }: InboundLikeDetailProps) {
  const { relationship, userProfile, likedProfiles, firstLikedProfile, latestLikedProfile, latestMessage, conversation } = context;
  const displayName = userProfile?.display_name?.trim() || 'Unknown user';

  return (
    <div className="space-y-5">
      <article className="overflow-hidden rounded-app border border-white/80 bg-merlot-900 text-cream-50 shadow-card">
        <div className="bg-[radial-gradient(circle_at_25%_15%,rgba(255,212,200,0.82),transparent_34%),linear-gradient(145deg,rgba(244,111,100,0.34),rgba(42,28,34,0.96))] p-6">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-cream-50/78">Inbound detail</p>
            <RelationshipStatusBadge status={relationship.status} />
          </div>
          <h1 className="mt-24 font-display text-5xl font-semibold leading-none tracking-[-0.05em]">{displayName}</h1>
          <p className="mt-3 text-sm font-semibold text-cream-50/82">{userProfile?.city ?? 'City not shared'} · {isProfileCompleteForJared(userProfile) ? 'Complete profile' : 'Incomplete profile'}</p>
        </div>
        <div className="grid gap-3 p-5 text-sm leading-6 text-cream-50/86">
          <p>{userProfile?.bio ?? 'No bio shared yet.'}</p>
          <p><span className="font-bold text-cream-50">Looking for:</span> {userProfile?.looking_for ?? 'Not shared'}</p>
          <p><span className="font-bold text-cream-50">Good first date:</span> {userProfile?.good_first_date ?? 'Not shared'}</p>
        </div>
      </article>

      <section className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Relationship context</p>
        <dl className="mt-4 grid gap-3 text-sm leading-6 text-ink-600">
          <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
            <dt className="font-bold text-ink-900">Liked date</dt>
            <dd>{formatDateTime(relationship.created_at)}</dd>
          </div>
          <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
            <dt className="font-bold text-ink-900">Liked Jared profiles</dt>
            <dd>{likedProfiles.length} total · first {firstLikedProfile?.internal_label ?? 'unavailable'} · latest {latestLikedProfile?.internal_label ?? 'unavailable'}</dd>
          </div>
          <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
            <dt className="font-bold text-ink-900">Profile context</dt>
            <dd>{likedProfiles.map((profile) => profile.internal_label).join(', ') || 'No profile labels available.'}</dd>
          </div>
          <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
            <dt className="font-bold text-ink-900">Timestamps</dt>
            <dd>Updated {formatDateTime(relationship.updated_at)} · decided {formatDateTime(relationship.decided_at)}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Decision controls</p>
        <p className="mt-3 text-sm leading-6 text-ink-600">Match Back opens exactly one matched conversation through the backend contract. Messaging stays a placeholder for Task 7.</p>
        <div className="mt-5 grid gap-3">
          <button className="rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" onClick={() => void onDecide('matched')} type="button">Match Back</button>
          <button className="rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900" onClick={() => void onDecide('passed')} type="button">Pass</button>
          <button className="rounded-full border border-merlot-900/10 bg-white/70 px-5 py-3 text-sm font-extrabold text-ink-600" onClick={() => void onDecide('archived')} type="button">Archive</button>
        </div>
        <p className="mt-4 text-sm leading-6 text-ink-600">{decisionStatus}</p>
        {conversation ? <p className="mt-2 text-sm leading-6 text-ink-600">Conversation ready · latest message placeholder: {latestMessage?.body ?? 'No messages yet.'}</p> : null}
      </section>

      <PrivateNotesPanel notes={context.notes} onAddNote={onAddNote} />
    </div>
  );
}
