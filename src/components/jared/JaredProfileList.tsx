import { Link } from 'react-router-dom';
import type { JaredProfile } from '../../types';

type JaredProfileListProps = {
  profiles: JaredProfile[];
  onArchive: (profile: JaredProfile) => void;
  onToggleActive: (profile: JaredProfile) => void;
  onToggleDemo: (profile: JaredProfile) => void;
  onMove: (profile: JaredProfile, direction: 'up' | 'down') => void;
};

export function JaredProfileList({
  profiles,
  onArchive,
  onMove,
  onToggleActive,
  onToggleDemo
}: JaredProfileListProps) {
  if (!profiles.length) {
    return (
      <div className="rounded-app border border-white/80 bg-white/84 p-6 text-sm leading-6 text-ink-600 shadow-card backdrop-blur-xl">
        No live CMS rows are available yet. Create the first profile or configure Supabase to load
        existing rows.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile, index) => (
        <article
          className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl"
          key={profile.id}
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">
                {profile.archived ? 'Archived' : profile.active ? 'Active' : 'Paused draft'}
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">
                {profile.internal_label}
              </h2>
              <p className="mt-2 text-sm font-semibold text-ink-600">
                Sort {profile.sort_order} · {profile.location} ·{' '}
                {profile.tags.slice(0, 3).join(', ') || 'No tags'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                className="rounded-full bg-blush-500 px-4 py-2 text-sm font-extrabold text-cream-50 shadow-glow"
                to={`/jared/profiles/${profile.id}`}
              >
                Edit
              </Link>
              <button
                className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-ink-600"
                disabled={index === 0}
                onClick={() => onMove(profile, 'up')}
                type="button"
              >
                Up
              </button>
              <button
                className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-ink-600"
                disabled={index === profiles.length - 1}
                onClick={() => onMove(profile, 'down')}
                type="button"
              >
                Down
              </button>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-ink-600"
              onClick={() => onToggleActive(profile)}
              type="button"
            >
              {profile.active ? 'Deactivate' : 'Activate'}
            </button>
            <button
              className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-ink-600"
              onClick={() => onToggleDemo(profile)}
              type="button"
            >
              {profile.demo_eligible ? 'Remove demo flag' : 'Demo eligible'}
            </button>
            <button
              className="rounded-full bg-merlot-900 px-4 py-2 text-sm font-extrabold text-cream-50"
              disabled={profile.archived}
              onClick={() => onArchive(profile)}
              type="button"
            >
              Archive
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
