import { Link } from 'react-router-dom';
import type { MessagingConversation } from '../../lib/messages';

type ConversationListProps = {
  conversations: MessagingConversation[];
  basePath: string;
};

function displayName(item: MessagingConversation): string {
  return item.userProfile?.display_name?.trim() || 'Matched user';
}

function previewText(item: MessagingConversation): string {
  return item.latestMessage?.body ?? 'Start the conversation';
}

export function ConversationList({ conversations, basePath }: ConversationListProps) {
  if (!conversations.length) {
    return (
      <div className="rounded-app border border-blush-100 bg-cream-50/80 p-5 text-sm leading-6 text-ink-600">
        <p className="font-bold text-ink-900">Start the conversation</p>
        <p className="mt-2">
          Matched, open conversations will appear here. Pending and archived relationships do not
          unlock messaging.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conversations.map((item) => (
        <Link
          className="block rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blush-100"
          key={item.conversation.id}
          to={`${basePath}/${item.conversation.id}`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blush-600">
                You and Jared matched
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">
                {displayName(item)}
              </h2>
            </div>
            {item.unreadCount ? (
              <span className="rounded-full bg-blush-500 px-3 py-1 text-xs font-extrabold text-cream-50">
                {item.unreadCount}
              </span>
            ) : null}
          </div>
          <p className="mt-4 truncate rounded-3xl border border-blush-100 bg-cream-50/80 p-3 text-sm leading-6 text-ink-600">
            {previewText(item)}
          </p>
        </Link>
      ))}
    </div>
  );
}
