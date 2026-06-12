import { Link } from 'react-router-dom';
import { parseJaredPrompts } from '../../data/jaredProfiles';
import { normalUserCopy } from '../../lib/normalDisplay';
import type { JaredProfile } from '../../types';

type ProfileDetailSheetProps = {
  profile: JaredProfile;
};

export function ProfileDetailSheet({ profile }: ProfileDetailSheetProps) {
  const prompts = parseJaredPrompts(profile);

  return (
    <article className="rounded-app border border-white/80 bg-white/84 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Profile</p>
      <div className="mt-4 overflow-hidden rounded-[1.75rem] bg-merlot-900 p-5 text-cream-50 shadow-card">
        <div className="min-h-52 rounded-[1.35rem] bg-[radial-gradient(circle_at_25%_20%,rgba(255,212,200,0.8),transparent_34%),linear-gradient(145deg,rgba(244,111,100,0.4),rgba(42,28,34,0.94))] p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-cream-50/78">{profile.location}</p>
          <h1 className="mt-24 font-display text-5xl font-semibold leading-none tracking-[-0.05em]">
            {profile.display_name}, {profile.age_label}
          </h1>
        </div>
      </div>
      <p className="mt-6 text-base leading-7 text-ink-600">{normalUserCopy(profile.bio)}</p>
      <div className="mt-6 space-y-3">
        {prompts.map((prompt) => (
          <section className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4" key={prompt.prompt}>
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blush-600">{prompt.prompt}</p>
            <p className="mt-2 text-sm leading-6 text-ink-900">{normalUserCopy(prompt.answer)}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        {profile.tags.map((tag) => (
          <span className="rounded-full bg-blush-50 px-3 py-1 text-xs font-bold text-merlot-900" key={tag}>
            {normalUserCopy(tag)}
          </span>
        ))}
      </div>
      <Link className="mt-7 inline-flex rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" to="/swipe">
        Back to deck
      </Link>
    </article>
  );
}
