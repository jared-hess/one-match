import { Link } from 'react-router-dom';
import { getQueuedSwipes } from '../../lib/swipes';

export function PendingState() {
  const queuedCount = getQueuedSwipes().length;

  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Like sent</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">
        Your interest is pending.
      </h1>
      <p className="mt-5 text-base leading-7 text-ink-600">
        Your like has been saved. Messaging only becomes available if Jared matches back, so there
        is no chat to open from this state.
      </p>
      <div className="mt-6 rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">
        {queuedCount > 0
          ? `${queuedCount} local like${queuedCount === 1 ? '' : 's'} will replay after sign-in and profile completion when live data is available.`
          : 'No local likes are waiting right now. You can keep browsing without signing in.'}
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link
          className="inline-flex rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow"
          to="/settings"
        >
          Sign in or complete profile
        </Link>
        <Link
          className="inline-flex rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900"
          to="/swipe"
        >
          Continue browsing
        </Link>
      </div>
    </section>
  );
}
