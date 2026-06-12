import type { DemoDeckSize } from '../../lib/demoMode';
import { DEMO_DECK_SIZES } from '../../lib/demoMode';

type DemoLauncherProps = {
  deckSize: DemoDeckSize;
  availableProfiles: number;
  onDeckSizeChange: (deckSize: DemoDeckSize) => void;
  onStart: () => void;
};

export function DemoLauncher({ deckSize, availableProfiles, onDeckSizeChange, onStart }: DemoLauncherProps) {
  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Jared-only demo</p>
      <h1 className="mt-4 font-display text-5xl font-semibold leading-[0.92] tracking-[-0.05em] text-merlot-900">Local candidate theater.</h1>
      <p className="mt-4 text-base leading-7 text-ink-600">
        Choose a deck size and run a no-write demo using only demo-eligible Jared profile cards. Changing the size resets the local demo session instantly.
      </p>
      <fieldset className="mt-6 grid grid-cols-3 gap-3">
        <legend className="sr-only">Demo deck size</legend>
        {DEMO_DECK_SIZES.map((size) => (
          <button
            aria-pressed={deckSize === size}
            className={`rounded-3xl border px-4 py-4 text-sm font-extrabold transition ${
              deckSize === size ? 'border-blush-500 bg-blush-500 text-cream-50 shadow-glow' : 'border-blush-100 bg-cream-50/80 text-merlot-900'
            }`}
            key={size}
            onClick={() => onDeckSizeChange(size)}
            type="button"
          >
            {size}
            <span className="mt-1 block text-[0.65rem] uppercase tracking-[0.18em]">cards</span>
          </button>
        ))}
      </fieldset>
      <div className="mt-6 rounded-3xl border border-blush-100 bg-cream-50/80 p-4">
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blush-600">Eligible profiles</p>
        <p className="mt-2 text-sm leading-6 text-ink-600">{availableProfiles} demo-safe cards are ready from loaded data plus fallback seed coverage.</p>
      </div>
      <button className="mt-6 w-full rounded-full bg-merlot-900 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-card" onClick={onStart} type="button">
        Launch Demo
      </button>
    </section>
  );
}
