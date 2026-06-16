import { Link } from 'react-router-dom';

export function MatchModal() {
  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-6 text-center shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">
        It’s a Match
      </p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-none tracking-[-0.05em] text-merlot-900">
        You and Jared have both expressed interest.
      </h1>
      <p className="mt-5 text-sm leading-6 text-ink-600">
        This is the mutual-interest screen. Full messaging is intentionally not available here yet,
        so the next step stays quiet until the conversation tools are ready.
      </p>
      <Link
        className="mt-6 inline-flex rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow"
        to="/swipe"
      >
        Back to discovery
      </Link>
    </section>
  );
}
