import { motion, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import { useEffect, useMemo, useState } from 'react';
import { acknowledgeSimilarityModal, getViewedCount, hasAcknowledgedSimilarityModal, recordAnonymousSwipe } from '../../lib/swipes';
import type { JaredProfile, SwipeDirection } from '../../types';
import { CandidateSimilarityModal } from './CandidateSimilarityModal';
import { LikeSentToast } from './LikeSentToast';
import { SwipeActions } from './SwipeActions';
import { SwipeCard } from './SwipeCard';

type SwipeDeckProps = {
  profiles: JaredProfile[];
};

const SWIPE_THRESHOLD = 110;

async function gentleHaptic() {
  try {
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics');
    await Haptics.impact({ style: ImpactStyle.Light });
  } catch {
    // Web and test environments do not need native haptics.
  }
}

export function SwipeDeck({ profiles }: SwipeDeckProps) {
  const [index, setIndex] = useState(0);
  const [toastVisible, setToastVisible] = useState(false);
  const [showSimilarity, setShowSimilarity] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-180, 180], [-9, 9]);
  const activeProfile = profiles[index];
  const nextProfile = profiles[index + 1];

  const remainingLabel = useMemo(() => {
    const remaining = Math.max(profiles.length - index, 0);
    return `${remaining} profile${remaining === 1 ? '' : 's'} left`;
  }, [index, profiles.length]);

  useEffect(() => {
    if (!toastVisible) {
      return;
    }

    const timeout = window.setTimeout(() => setToastVisible(false), 3600);
    return () => window.clearTimeout(timeout);
  }, [toastVisible]);

  function finishSwipe(direction: SwipeDirection) {
    if (!activeProfile) {
      return;
    }

    void gentleHaptic();
    recordAnonymousSwipe(activeProfile.id, direction);

    if ((direction === 'right' || direction === 'super') && typeof window !== 'undefined') {
      setToastVisible(true);
    }

    const viewedCount = getViewedCount();
    if (viewedCount >= 4 && !hasAcknowledgedSimilarityModal()) {
      setShowSimilarity(true);
    }

    setIndex((current) => current + 1);
    x.set(0);
  }

  function handleDragEnd(_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      finishSwipe('right');
      return;
    }

    if (info.offset.x < -SWIPE_THRESHOLD) {
      finishSwipe('left');
    }
  }

  function closeSimilarity() {
    acknowledgeSimilarityModal();
    setShowSimilarity(false);
  }

  if (!activeProfile) {
    return (
      <section className="rounded-app border border-white/80 bg-white/84 p-6 text-center shadow-card backdrop-blur-xl">
        <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Deck complete</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">You have seen today’s Jared profiles.</h1>
        <p className="mt-4 text-sm leading-6 text-ink-600">Saved likes stay pending locally until you complete profile setup and live data is available.</p>
      </section>
    );
  }

  return (
    <section aria-label="Jared swipe deck">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Swipe</p>
          <h1 className="font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">Choose deliberately.</h1>
        </div>
        <span className="rounded-full border border-blush-100 bg-white/80 px-3 py-1 text-xs font-extrabold text-ink-600 shadow-sm">{remainingLabel}</span>
      </div>
      <div className="relative h-[32rem]">
        {nextProfile ? (
          <div className="absolute inset-0 translate-y-5">
            <SwipeCard profile={nextProfile} isPeek />
          </div>
        ) : null}
        <motion.div
          animate={{ scale: 1, opacity: 1 }}
          className="absolute inset-0 cursor-grab active:cursor-grabbing"
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          style={{ x, rotate }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          whileDrag={{ scale: 1.02 }}
        >
          <SwipeCard profile={activeProfile} />
        </motion.div>
      </div>
      <p className="mt-4 rounded-3xl border border-blush-100 bg-white/72 p-4 text-sm leading-6 text-ink-600">
        Drag right to like, left to pass, or use Super when the signal is especially strong. Likes do not open chat.
      </p>
      <SwipeActions onAction={finishSwipe} />
      <LikeSentToast visible={toastVisible} />
      {showSimilarity ? <CandidateSimilarityModal onClose={closeSimilarity} /> : null}
    </section>
  );
}
