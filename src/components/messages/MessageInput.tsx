import { useState } from 'react';
import type { FormEvent } from 'react';

type MessageInputProps = {
  disabled: boolean;
  helperText: string;
  onSend: (body: string) => Promise<void>;
};

export function MessageInput({ disabled, helperText, onSend }: MessageInputProps) {
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextBody = body.trim();

    if (!nextBody || disabled || sending) {
      return;
    }

    setSending(true);
    try {
      await onSend(nextBody);
      setBody('');
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      className="rounded-[1.75rem] border border-white/80 bg-white/86 p-3 shadow-card backdrop-blur-xl"
      onSubmit={handleSubmit}
    >
      <label className="sr-only" htmlFor="message-body">
        Send a message...
      </label>
      <div className="flex gap-2">
        <textarea
          className="min-h-12 flex-1 resize-none rounded-3xl border border-blush-100 bg-cream-50/80 px-4 py-3 text-sm leading-5 text-ink-900 outline-none transition focus:border-blush-500 disabled:cursor-not-allowed disabled:text-ink-600"
          disabled={disabled || sending}
          id="message-body"
          onChange={(event) => setBody(event.target.value)}
          placeholder="Send a message..."
          value={body}
        />
        <button
          className="self-stretch rounded-3xl bg-blush-500 px-4 text-sm font-extrabold text-cream-50 shadow-glow transition disabled:cursor-not-allowed disabled:bg-blush-100 disabled:text-ink-600 disabled:shadow-none"
          disabled={disabled || sending || !body.trim()}
          type="submit"
        >
          Send
        </button>
      </div>
      <p className="mt-2 px-2 text-xs font-semibold leading-5 text-ink-600">{helperText}</p>
    </form>
  );
}
