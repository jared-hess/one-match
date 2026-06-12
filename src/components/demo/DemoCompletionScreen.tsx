import { ExternalLink, Share2, Square } from 'lucide-react';
import { Link } from 'react-router-dom';

type DemoCompletionScreenProps = {
  canShare: boolean;
  shareStatus: string;
  onEndDemo: () => void;
  onShare: () => void;
};

export function DemoCompletionScreen({ canShare, shareStatus, onEndDemo, onShare }: DemoCompletionScreenProps) {
  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-6 text-center shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Demo complete</p>
      <h2 className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">Candidate pool evaluation complete.</h2>
      <p className="mt-4 text-sm leading-6 text-ink-600">
        This was a local-only tour of demo-eligible Jared profiles. No inbound users, relationships, private notes, messages, or queued normal swipes were used.
      </p>
      <div className="mt-6 grid gap-3">
        <button className="inline-flex items-center justify-center gap-2 rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" onClick={onEndDemo} type="button">
          <Square className="h-4 w-4" aria-hidden="true" />
          End Demo
        </button>
        <Link className="inline-flex items-center justify-center gap-2 rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900" to="/">
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Open Public App
        </Link>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-merlot-900/10 bg-white/70 px-5 py-3 text-sm font-extrabold text-ink-600 disabled:cursor-not-allowed disabled:opacity-55"
          disabled={!canShare}
          onClick={onShare}
          type="button"
        >
          <Share2 className="h-4 w-4" aria-hidden="true" />
          Share Link
        </button>
      </div>
      <p className="mt-4 text-xs font-bold text-ink-600" role="status">
        {shareStatus}
      </p>
    </section>
  );
}
