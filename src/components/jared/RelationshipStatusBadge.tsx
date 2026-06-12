import type { RelationshipStatus } from '../../types';

type RelationshipStatusBadgeProps = {
  status: RelationshipStatus;
};

const statusCopy: Record<RelationshipStatus, string> = {
  pending: 'Pending review',
  matched: 'Matched',
  passed: 'Passed',
  unmatched: 'Unmatched',
  archived: 'Archived'
};

const statusClassName: Record<RelationshipStatus, string> = {
  pending: 'border-blush-100 bg-blush-50 text-blush-600',
  matched: 'border-white/45 bg-cream-50/16 text-cream-50',
  passed: 'border-ink-600/10 bg-white/70 text-ink-600',
  unmatched: 'border-ink-600/10 bg-white/70 text-ink-600',
  archived: 'border-merlot-900/10 bg-merlot-900/8 text-merlot-900'
};

export function RelationshipStatusBadge({ status }: RelationshipStatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-[0.18em] ${statusClassName[status]}`}>
      {statusCopy[status]}
    </span>
  );
}
