import type { RelationshipStatus } from '../../types';

type RelationshipStatusBadgeProps = {
  status: RelationshipStatus;
  tone?: 'light' | 'dark';
};

const statusCopy: Record<RelationshipStatus, string> = {
  pending: 'Pending review',
  matched: 'Matched',
  passed: 'Passed',
  unmatched: 'Unmatched',
  archived: 'Archived'
};

const lightStatusClassName: Record<RelationshipStatus, string> = {
  pending: 'border-blush-100 bg-blush-50 text-blush-600',
  matched: 'border-blush-100 bg-blush-50 text-merlot-900',
  passed: 'border-ink-600/10 bg-white/70 text-ink-600',
  unmatched: 'border-ink-600/10 bg-white/70 text-ink-600',
  archived: 'border-merlot-900/10 bg-merlot-900/8 text-merlot-900'
};

const darkStatusClassName: Record<RelationshipStatus, string> = {
  pending: 'border-white/45 bg-cream-50/16 text-cream-50',
  matched: 'border-white/45 bg-cream-50/16 text-cream-50',
  passed: 'border-white/35 bg-white/12 text-cream-50',
  unmatched: 'border-white/35 bg-white/12 text-cream-50',
  archived: 'border-white/35 bg-white/12 text-cream-50'
};

export function RelationshipStatusBadge({ status, tone = 'light' }: RelationshipStatusBadgeProps) {
  const statusClassName = tone === 'dark' ? darkStatusClassName : lightStatusClassName;

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${statusClassName[status]}`}
    >
      {statusCopy[status]}
    </span>
  );
}
