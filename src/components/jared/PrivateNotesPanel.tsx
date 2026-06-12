import { useState, type FormEvent } from 'react';
import type { JaredNote } from '../../types';

type PrivateNotesPanelProps = {
  notes: JaredNote[];
  onAddNote: (note: string) => Promise<string | null>;
};

function formatDate(value: string | null): string {
  if (!value) {
    return 'Not recorded';
  }

  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value));
}

export function PrivateNotesPanel({ notes, onAddNote }: PrivateNotesPanelProps) {
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('Private notes stay in Jared-only routes.');
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    const message = await onAddNote(note);
    setStatus(message ?? 'Note saved. Refreshing the private timeline.');

    if (!message) {
      setNote('');
    }

    setSaving(false);
  }

  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
      <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Private notes</p>
      <form className="mt-4 space-y-3" onSubmit={(event) => void handleSubmit(event)}>
        <textarea
          className="min-h-28 w-full rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-900 outline-none focus:border-blush-500"
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add context Jared should remember before deciding."
          value={note}
        />
        <button className="rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow disabled:opacity-60" disabled={saving} type="submit">
          {saving ? 'Saving…' : 'Add note'}
        </button>
      </form>
      <p className="mt-3 text-sm leading-6 text-ink-600">{status}</p>
      <div className="mt-5 space-y-3">
        {notes.length ? (
          notes.map((item) => (
            <article className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4" key={item.id}>
              <p className="text-sm leading-6 text-ink-900">{item.note}</p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.18em] text-ink-600">{formatDate(item.created_at)}</p>
            </article>
          ))
        ) : (
          <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">No private notes yet.</p>
        )}
      </div>
    </section>
  );
}
