type CandidateSimilarityModalProps = {
  onClose: () => void;
};

export function CandidateSimilarityModal({ onClose }: CandidateSimilarityModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-end bg-ink-900/45 px-5 pb-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="similarity-title">
      <section className="mx-auto w-full max-w-md rounded-app border border-white/80 bg-white p-6 shadow-card">
        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Pattern noticed</p>
        <h2 className="mt-3 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900" id="similarity-title">
          These profiles may feel related.
        </h2>
        <p className="mt-4 text-sm leading-6 text-ink-600">
          You have viewed four Jared profiles. Each one is a different angle on the same person, so compare tone, details, and date energy carefully.
        </p>
        <button className="mt-6 w-full rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" onClick={onClose} type="button">
          Keep browsing thoughtfully
        </button>
      </section>
    </div>
  );
}
