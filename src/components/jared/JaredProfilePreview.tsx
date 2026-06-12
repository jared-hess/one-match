import { SwipeCard } from '../normal/SwipeCard';
import type { JaredProfile } from '../../types';

type JaredProfilePreviewProps = {
  profile: JaredProfile;
};

export function JaredProfilePreview({ profile }: JaredProfilePreviewProps) {
  return (
    <section aria-label="Normal-user profile preview" className="space-y-3">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Normal preview boundary</p>
      <SwipeCard profile={profile} />
      <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">
        Preview uses the same card component as the normal swipe deck, so the visible card title remains Jared with age and location only.
      </p>
    </section>
  );
}
