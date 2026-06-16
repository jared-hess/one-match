import type { Message } from '../../types';

type MessageBubbleProps = {
  message: Message;
  own: boolean;
  senderLabel: string;
};

function formatMessageTime(value: string): string {
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(
    new Date(value)
  );
}

export function MessageBubble({ message, own, senderLabel }: MessageBubbleProps) {
  return (
    <article className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[82%] rounded-[1.75rem] px-4 py-3 shadow-card ${
          own
            ? 'rounded-br-md bg-blush-500 text-cream-50'
            : 'rounded-bl-md border border-blush-100 bg-cream-50/90 text-ink-900'
        }`}
      >
        <p
          className={`text-[0.65rem] font-extrabold uppercase tracking-[0.18em] ${own ? 'text-cream-50/80' : 'text-blush-600'}`}
        >
          {senderLabel}
        </p>
        <p className="mt-1 whitespace-pre-wrap text-sm leading-6">{message.body}</p>
        <p
          className={`mt-2 text-right text-[0.68rem] font-bold ${own ? 'text-cream-50/75' : 'text-ink-600'}`}
        >
          {formatMessageTime(message.created_at)}
        </p>
      </div>
    </article>
  );
}
