import { useMemo, useState } from 'react';
import { recordSwipe } from '../../lib/swipes';
import { markJaredDemoSimilarityRevealed, recordJaredDemoSwipe, type JaredDemoState } from '../../lib/demoMode';
import type { JaredProfile, SwipeDirection } from '../../types';
import { CandidateSimilarityModal } from '../normal/CandidateSimilarityModal';
import { SwipeActions } from '../normal/SwipeActions';
import { SwipeCard } from '../normal/SwipeCard';
import { DemoCompletionScreen } from './DemoCompletionScreen';

type DemoSwipeFlowProps = {
  profiles: JaredProfile[];
  state: JaredDemoState;
  canShare: boolean;
  shareStatus: string;
  onComplete: () => void;
  onEndDemo: () => void;
  onShare: () => void;
};

export function DemoSwipeFlow({ profiles, state, canShare, shareStatus, onComplete, onEndDemo, onShare }: DemoSwipeFlowProps) {
  const [index, setIndex] = useState(state.viewedProfileIds.length);
  const [showSimilarity, setShowSimilarity] = useState(false);
  const activeProfile = profiles[index];
  const nextProfile = profiles[index + 1];
  const remainingLabel = useMemo(() => `${Math.max(profiles.length - index, 0)} demo card${profiles.length - index === 1 ? '' : 's'} left`, [index, profiles.length]);

  function finishSwipe(direction: SwipeDirection) {
    if (!activeProfile) {
      return;
    }

    const nextState = recordJaredDemoSwipe(activeProfile.id, direction);
    void recordSwipe(activeProfile.id, direction, { demoMode: true });

    if (nextState.viewedProfileIds.length === 2 && !nextState.similarityRevealed) {
      markJaredDemoSimilarityRevealed();
      setShowSimilarity(true);
    }

    const nextIndex = index + 1;
    setIndex(nextIndex);

    if (nextIndex >= profiles.length) {
      onComplete();
    }
  }

  if (!activeProfile) {
    return <DemoCompletionScreen canShare={canShare} onEndDemo={onEndDemo} onShare={onShare} shareStatus={shareStatus} />;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">No-write demo deck</p>
        <div className="mt-3 flex items-center justify-between gap-3">
          <h1 className="font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">Swipe locally.</h1>
          <span className="rounded-full bg-cream-50 px-3 py-1 text-xs font-extrabold text-ink-600">{remainingLabel}</span>
        </div>
      </div>
      <div className="relative">
        {nextProfile ? (
          <div className="absolute inset-x-4 top-5 -z-10">
            <SwipeCard isPeek profile={nextProfile} />
          </div>
        ) : null}
        <SwipeCard profile={activeProfile} />
      </div>
      <SwipeActions onAction={finishSwipe} />
      <button className="w-full rounded-full border border-blush-100 bg-cream-50/80 px-5 py-3 text-sm font-extrabold text-merlot-900" onClick={onEndDemo} type="button">
        End Demo
      </button>
      {showSimilarity ? <CandidateSimilarityModal onClose={() => setShowSimilarity(false)} /> : null}
    </section>
  );
}
