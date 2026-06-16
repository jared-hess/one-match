import { Link } from 'react-router-dom';
import type { InboundRelationshipContext, JaredProfile } from '../../types';

type JaredHomeProps = {
  pendingContexts: InboundRelationshipContext[];
  matchedContexts: InboundRelationshipContext[];
  activeProfiles: JaredProfile[];
};

export function JaredHome({ pendingContexts, matchedContexts, activeProfiles }: JaredHomeProps) {
  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">
        Jared workspace
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-merlot-900">
        Private control room.
      </h1>
      <p className="mt-4 text-base leading-7 text-ink-600">
        Review inbound likes, keep private notes, and open matched conversations without exposing
        Jared-only context to normal users.
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <Metric label="New likes" value={pendingContexts.length} />
        <Metric label="Active matches" value={matchedContexts.length} />
        <Metric label="Unread placeholders" value={matchedContexts.length ? 'Queued' : 'None'} />
        <Metric label="Active profiles" value={activeProfiles.length} />
      </div>
      <div className="mt-6 space-y-3">
        <Link
          className="flex justify-between rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow"
          to="/jared/inbound"
        >
          <span>Open inbound likes</span>
          <span>{pendingContexts.length}</span>
        </Link>
        <Link
          className="flex justify-between rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900"
          to="/jared/matches"
        >
          <span>Review matches</span>
          <span>{matchedContexts.length}</span>
        </Link>
        <Link
          className="flex justify-between rounded-full border border-merlot-900/10 bg-white/70 px-5 py-3 text-sm font-extrabold text-ink-600"
          to="/jared/demo"
        >
          <span>Launch guarded demo entry</span>
          <span>Task 9 later</span>
        </Link>
      </div>
      <div className="mt-6 space-y-3">
        {activeProfiles.slice(0, 3).map((profile) => (
          <article
            className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4"
            key={profile.id}
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blush-600">
              {profile.internal_label}
            </p>
            <p className="mt-2 text-sm leading-6 text-ink-600">
              {profile.location} · {profile.tags.slice(0, 2).join(', ')}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
      <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blush-600">{label}</p>
      <p className="mt-2 text-2xl font-bold text-merlot-900">{value}</p>
    </div>
  );
}
