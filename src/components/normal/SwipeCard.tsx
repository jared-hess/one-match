import { Link } from 'react-router-dom';
import { getNormalDisplayName } from '../../lib/normalDisplay';
import type { JaredProfile } from '../../types';

type SwipeCardProps = {
  profile: JaredProfile;
  isPeek?: boolean;
};

export function SwipeCard({ profile, isPeek = false }: SwipeCardProps) {
  return (
    <article
      className={`relative flex h-[32rem] flex-col justify-end overflow-hidden rounded-app border border-white/80 bg-merlot-900 shadow-card ${
        isPeek ? 'scale-[0.94] opacity-60' : ''
      }`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_15%,rgba(255,212,200,0.78),transparent_34%),linear-gradient(150deg,rgba(122,35,50,0.12),rgba(42,28,34,0.92))]" />
      <div className="absolute left-7 top-7 h-32 w-32 rounded-full bg-blush-500/25 blur-3xl" />
      <div className="absolute right-6 top-8 rounded-full border border-white/50 bg-white/18 px-3 py-1 text-xs font-extrabold uppercase tracking-[0.22em] text-cream-50 backdrop-blur">
        {profile.location}
      </div>
      <div className="relative p-6 text-cream-50">
        <h2 className="font-display text-5xl font-semibold leading-none tracking-[-0.05em]">
          {getNormalDisplayName()}, {profile.age_label}
        </h2>
        {!isPeek ? (
          <Link
            className="mt-6 inline-flex text-sm font-extrabold text-cream-50 underline decoration-blush-100/70 underline-offset-4"
            to={`/profile/${profile.id}`}
          >
            Read the profile
          </Link>
        ) : null}
      </div>
    </article>
  );
}
