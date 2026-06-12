import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { fetchOwnProfile, upsertOwnProfile } from '../../lib/profiles';
import { replayQueuedSwipes } from '../../lib/swipes';
import { getSupabase } from '../../lib/supabase';

type FormState = {
  display_name: string;
  age_confirmed: boolean;
  city: string;
  bio: string;
  looking_for: string;
  good_first_date: string;
  social_link: string;
};

const initialState: FormState = {
  display_name: '',
  age_confirmed: false,
  city: '',
  bio: '',
  looking_for: '',
  good_first_date: '',
  social_link: ''
};

export function ProfileForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState('Complete the required fields before replaying any saved likes.');
  const [submitting, setSubmitting] = useState(false);
  const requiredReady = form.display_name.trim() && form.city.trim() && form.age_confirmed;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!requiredReady) {
      setStatus('Display name, 18+ confirmation, and city are required.');
      return;
    }

    setSubmitting(true);
    const supabase = getSupabase();

    if (!supabase.available) {
      setStatus('Profile details are saved in this form only for now. Add Supabase keys before queued likes can replay.');
      setSubmitting(false);
      return;
    }

    const userResult = await supabase.client.auth.getUser();
    const user = userResult.data.user;

    if (!user) {
      setStatus('Sign in before saving your profile and replaying queued likes.');
      setSubmitting(false);
      return;
    }

    const result = await upsertOwnProfile({
      user_id: user.id,
      email: user.email ?? null,
      display_name: form.display_name.trim(),
      age_confirmed: form.age_confirmed,
      city: form.city.trim(),
      bio: form.bio.trim() || null,
      looking_for: form.looking_for.trim() || null,
      good_first_date: form.good_first_date.trim() || null,
      social_link: form.social_link.trim() || null,
      onboarding_completed_at: new Date().toISOString()
    });

    if (result.error) {
      setStatus(result.error.message);
      setSubmitting(false);
      return;
    }

    await fetchOwnProfile();
    const replay = await replayQueuedSwipes();
    setStatus(replay.retained.length ? replay.reason ?? 'Some likes remain queued locally.' : `Profile complete. Replayed ${replay.replayed} saved like${replay.replayed === 1 ? '' : 's'}.`);
    setSubmitting(false);
  }

  return (
    <form className="rounded-app border border-white/80 bg-white/84 p-6 shadow-card backdrop-blur-xl" onSubmit={handleSubmit}>
      <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-blush-600">Complete profile</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">Tell Jared enough to respond seriously.</h1>
      <p className="mt-4 text-sm leading-6 text-ink-600">Required: display name, 18+ confirmation, and city. Optional details can stay brief.</p>
      <div className="mt-6 space-y-4">
        <label className="block text-sm font-bold text-ink-900">
          Display name
          <input className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" onChange={(event) => setForm({ ...form, display_name: event.target.value })} required value={form.display_name} />
        </label>
        <label className="block text-sm font-bold text-ink-900">
          City
          <input className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" onChange={(event) => setForm({ ...form, city: event.target.value })} required value={form.city} />
        </label>
        <label className="flex items-start gap-3 rounded-3xl border border-blush-100 bg-cream-50/70 p-4 text-sm font-bold text-ink-900">
          <input className="mt-1 h-4 w-4 accent-blush-500" checked={form.age_confirmed} onChange={(event) => setForm({ ...form, age_confirmed: event.target.checked })} required type="checkbox" />
          I confirm I am 18 or older.
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Bio
          <textarea className="mt-2 min-h-24 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" onChange={(event) => setForm({ ...form, bio: event.target.value })} value={form.bio} />
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Looking for
          <input className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" onChange={(event) => setForm({ ...form, looking_for: event.target.value })} value={form.looking_for} />
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Good first date
          <input className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" onChange={(event) => setForm({ ...form, good_first_date: event.target.value })} value={form.good_first_date} />
        </label>
        <label className="block text-sm font-bold text-ink-900">
          Social link or photo note
          <input className="mt-2 w-full rounded-3xl border border-blush-100 bg-cream-50/70 px-4 py-3 text-ink-900 outline-none focus:border-blush-500" onChange={(event) => setForm({ ...form, social_link: event.target.value })} value={form.social_link} />
        </label>
      </div>
      <button className="mt-6 w-full rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow disabled:cursor-not-allowed disabled:bg-blush-100" disabled={!requiredReady || submitting} type="submit">
        {submitting ? 'Saving carefully...' : 'Save profile'}
      </button>
      <p className="mt-4 text-sm leading-6 text-ink-600" role="status">{status}</p>
      <Link className="mt-4 inline-flex text-sm font-extrabold text-blush-600 underline underline-offset-4" to="/swipe">
        Return to discovery
      </Link>
    </form>
  );
}
