import { Link } from 'react-router-dom';
import { isProfileCompleteForJared } from '../../lib/relationships';
import type { InboundRelationshipContext } from '../../types';
import { RelationshipStatusBadge } from './RelationshipStatusBadge';

type InboundLikeCardProps = {
  context: InboundRelationshipContext;
};

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(new Date(value));
}

export function InboundLikeCard({ context }: InboundLikeCardProps) {
  const { relationship, userProfile, likedProfiles, firstLikedProfile, latestLikedProfile, notes } =
    context;
  const displayName = userProfile?.display_name?.trim() || 'Unknown user';
  const city = userProfile?.city?.trim() || 'City not shared';
  const photoUrl = userProfile?.photo_urls[0];

  return (
    <article className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
      <div className="flex items-start gap-4">
        {photoUrl ? (
          <img
            alt={`${displayName} profile`}
            className="h-16 w-16 rounded-3xl object-cover shadow-card"
            src={photoUrl}
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-blush-100 bg-cream-50/80 p-2 text-center text-[0.62rem] font-extrabold uppercase leading-3 tracking-[0.14em] text-ink-600">
            No photo shared
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">
            Liked {formatDate(relationship.created_at)}
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">
            {displayName}
          </h2>
          <p className="mt-2 text-sm font-semibold text-ink-600">{city}</p>
        </div>
        <RelationshipStatusBadge status={relationship.status} />
      </div>
      <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blush-600">
            Liked profiles
          </p>
          <p className="mt-2 text-2xl font-bold text-merlot-900">{likedProfiles.length}</p>
        </div>
        <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blush-600">
            Profile
          </p>
          <p className="mt-2 font-bold text-merlot-900">
            {isProfileCompleteForJared(userProfile) ? 'Complete' : 'Incomplete'}
          </p>
        </div>
      </div>
      <dl className="mt-5 space-y-2 text-sm leading-6 text-ink-600">
        <div>
          <dt className="font-bold text-ink-900">First label</dt>
          <dd>{firstLikedProfile?.internal_label ?? 'Unavailable'}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink-900">Latest label</dt>
          <dd>{latestLikedProfile?.internal_label ?? 'Unavailable'}</dd>
        </div>
        <div>
          <dt className="font-bold text-ink-900">Notes</dt>
          <dd>
            {notes.length} private note{notes.length === 1 ? '' : 's'}
          </dd>
        </div>
      </dl>
      <Link
        className="mt-5 inline-flex rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow"
        to={`/jared/inbound/${relationship.id}`}
      >
        Review inbound like
      </Link>
    </article>
  );
}
