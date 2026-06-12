import type { Message } from '../../types';
import type { MessagingConversation } from '../../lib/messages';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';

type ChatThreadProps = {
  conversation: MessagingConversation | null;
  currentUserId: string | null;
  messages: Message[];
  disabledReason: string;
  statusText: string;
  onRefresh: () => void;
  onSend: (body: string) => Promise<void>;
};

function participantName(conversation: MessagingConversation | null): string {
  return conversation?.userProfile?.display_name?.trim() || 'Matched user';
}

export function ChatThread({ conversation, currentUserId, messages, disabledReason, statusText, onRefresh, onSend }: ChatThreadProps) {
  const canSend = Boolean(conversation && currentUserId && conversation.relationship.status === 'matched' && conversation.conversation.status === 'open');
  const otherName = participantName(conversation);

  return (
    <div className="space-y-4">
      <div className="rounded-app border border-blush-100 bg-cream-50/80 p-5">
        <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-blush-600">You and Jared matched</p>
        <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">Start the conversation</h2>
        <div className="mt-3 flex items-center justify-between gap-3 text-sm leading-6 text-ink-600">
          <p>{statusText}</p>
          <button className="shrink-0 rounded-full border border-blush-100 bg-white/80 px-3 py-2 text-xs font-extrabold text-blush-600" onClick={onRefresh} type="button">
            Refresh
          </button>
        </div>
      </div>
      <div className="min-h-80 space-y-3 rounded-app border border-white/80 bg-white/70 p-4 shadow-card backdrop-blur-xl">
        {messages.length ? (
          messages.map((message) => {
            const own = message.sender_id === currentUserId;
            return <MessageBubble key={message.id} message={message} own={own} senderLabel={own ? 'You' : otherName === 'Matched user' ? 'Jared' : otherName} />;
          })
        ) : (
          <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-5 text-sm leading-6 text-ink-600">
            <p className="font-bold text-ink-900">Start the conversation</p>
            <p className="mt-2">No messages yet. Pending, passed, unmatched, and archived relationships stay read-only.</p>
          </div>
        )}
      </div>
      <MessageInput disabled={!canSend} helperText={canSend ? 'Send a message only inside this matched, open Jared conversation.' : disabledReason} onSend={onSend} />
    </div>
  );
}
