import { Heart, Sparkles, X } from 'lucide-react';
import type { SwipeDirection } from '../../types';

type SwipeActionsProps = {
  onAction: (direction: SwipeDirection) => void;
};

const actionStyles: Record<SwipeDirection, string> = {
  left: 'border-ink-600/15 bg-white/84 text-ink-600 hover:bg-cream-50',
  right: 'border-blush-100 bg-blush-500 text-cream-50 shadow-glow hover:bg-blush-600',
  super: 'border-merlot-900/15 bg-merlot-900 text-cream-50 shadow-card hover:bg-ink-900'
};

export function SwipeActions({ onAction }: SwipeActionsProps) {
  return (
    <fieldset className="mt-5 grid grid-cols-3 gap-3">
      <legend className="sr-only">Swipe actions</legend>
      <button className={`rounded-3xl border px-4 py-4 transition ${actionStyles.left}`} onClick={() => onAction('left')} type="button">
        <X className="mx-auto h-6 w-6" aria-hidden="true" />
        <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.18em]">Pass</span>
      </button>
      <button className={`rounded-3xl border px-4 py-4 transition ${actionStyles.right}`} onClick={() => onAction('right')} type="button">
        <Heart className="mx-auto h-6 w-6 fill-current" aria-hidden="true" />
        <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.18em]">Like</span>
      </button>
      <button className={`rounded-3xl border px-4 py-4 transition ${actionStyles.super}`} onClick={() => onAction('super')} type="button">
        <Sparkles className="mx-auto h-6 w-6" aria-hidden="true" />
        <span className="mt-2 block text-xs font-extrabold uppercase tracking-[0.18em]">Super</span>
      </button>
    </fieldset>
  );
}
