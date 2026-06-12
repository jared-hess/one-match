import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { JaredProfilePreview } from './JaredProfilePreview';
import { PhotoUploader } from './PhotoUploader';
import type { JaredProfile, JaredProfileInsert, JaredProfileUpdate, Json } from '../../types';

type PromptRow = {
  prompt: string;
  answer: string;
};

type JaredProfileFormValues = {
  slug: string;
  internal_label: string;
  display_name: string;
  age_label: string;
  location: string;
  bio: string;
  prompts: PromptRow[];
  tags: string[];
  image_urls: string[];
  sort_order: number;
  demo_eligible: boolean;
  active: boolean;
  archived: boolean;
};

type JaredProfileFormProps = {
  profile: JaredProfile | null;
  onSubmit: (input: JaredProfileInsert | JaredProfileUpdate) => Promise<void>;
};

const DEFAULT_PROMPT: PromptRow = { prompt: '', answer: '' };

export function JaredProfileForm({ profile, onSubmit }: JaredProfileFormProps) {
  const [values, setValues] = useState<JaredProfileFormValues>(() => createInitialValues(profile));
  const [tagText, setTagText] = useState(() => values.tags.join(', '));
  const [saving, setSaving] = useState(false);

  const previewProfile = useMemo<JaredProfile>(() => ({
    id: profile?.id ?? 'preview-profile',
    slug: values.slug,
    internal_label: values.internal_label,
    display_name: values.display_name,
    age_label: values.age_label,
    location: values.location,
    bio: values.bio,
    prompts: serializePrompts(values.prompts),
    tags: values.tags,
    image_urls: values.image_urls,
    sort_order: values.sort_order,
    demo_eligible: values.demo_eligible,
    active: values.active,
    archived: values.archived,
    created_at: profile?.created_at ?? new Date(0).toISOString(),
    updated_at: profile?.updated_at ?? new Date(0).toISOString()
  }), [profile, values]);

  function updateValue<Key extends keyof JaredProfileFormValues>(key: Key, value: JaredProfileFormValues[Key]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function updatePrompt(index: number, key: keyof PromptRow, value: string) {
    updateValue('prompts', values.prompts.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  function addImageUrl(url: string) {
    updateValue('image_urls', [...values.image_urls, url]);
  }

  function removeImageUrl(url: string) {
    updateValue('image_urls', values.image_urls.filter((imageUrl) => imageUrl !== url));
  }

  function moveImageUrl(fromIndex: number, toIndex: number) {
    if (toIndex < 0 || toIndex >= values.image_urls.length) {
      return;
    }

    const nextUrls = [...values.image_urls];
    const [url] = nextUrls.splice(fromIndex, 1);
    nextUrls.splice(toIndex, 0, url);
    updateValue('image_urls', nextUrls);
  }

  function syncTags(nextTagText: string) {
    setTagText(nextTagText);
    updateValue('tags', nextTagText.split(',').map((tag) => tag.trim()).filter(Boolean));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);

    try {
      await onSubmit(serializeValues(values));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
      <form className="space-y-5" onSubmit={(event) => void handleSubmit(event)}>
        <section className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Profile details</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Field label="Internal label">
              <input className={fieldClassName} onChange={(event) => updateValue('internal_label', event.target.value)} required value={values.internal_label} />
            </Field>
            <Field label="Slug">
              <input className={fieldClassName} onChange={(event) => updateValue('slug', event.target.value)} required value={values.slug} />
            </Field>
            <Field label="Display name">
              <input className={fieldClassName} onChange={(event) => updateValue('display_name', event.target.value)} value={values.display_name} />
            </Field>
            <Field label="Age label">
              <input className={fieldClassName} onChange={(event) => updateValue('age_label', event.target.value)} value={values.age_label} />
            </Field>
            <Field label="Location">
              <input className={fieldClassName} onChange={(event) => updateValue('location', event.target.value)} value={values.location} />
            </Field>
            <Field label="Sort order">
              <input className={fieldClassName} onChange={(event) => updateValue('sort_order', Number(event.target.value))} type="number" value={values.sort_order} />
            </Field>
          </div>
          <Field label="Bio">
            <textarea className={`${fieldClassName} min-h-32 rounded-3xl`} onChange={(event) => updateValue('bio', event.target.value)} required value={values.bio} />
          </Field>
          <Field label="Tags">
            <input className={fieldClassName} onChange={(event) => syncTags(event.target.value)} placeholder="Dinner, Oakland, movies" value={tagText} />
          </Field>
          <div className="mt-5 flex flex-wrap gap-3">
            <Toggle checked={values.active} label="Active in deck" onChange={(checked) => updateValue('active', checked)} />
            <Toggle checked={values.demo_eligible} label="Demo eligible" onChange={(checked) => updateValue('demo_eligible', checked)} />
            <Toggle checked={values.archived} label="Archived" onChange={(checked) => updateValue('archived', checked)} />
          </div>
        </section>

        <section className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Prompts</p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">Repeatable question and answer rows.</h2>
            </div>
            <button className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-merlot-900" onClick={() => updateValue('prompts', [...values.prompts, DEFAULT_PROMPT])} type="button">
              Add prompt
            </button>
          </div>
          <div className="mt-5 space-y-4">
            {values.prompts.map((row, index) => (
              <div className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4" key={index}>
                <Field label={`Prompt ${index + 1}`}>
                  <input className={fieldClassName} onChange={(event) => updatePrompt(index, 'prompt', event.target.value)} value={row.prompt} />
                </Field>
                <Field label="Answer">
                  <textarea className={`${fieldClassName} min-h-24 rounded-3xl`} onChange={(event) => updatePrompt(index, 'answer', event.target.value)} value={row.answer} />
                </Field>
                <button className="text-sm font-extrabold text-blush-600" onClick={() => updateValue('prompts', values.prompts.filter((_, rowIndex) => rowIndex !== index))} type="button">
                  Remove prompt
                </button>
              </div>
            ))}
          </div>
        </section>

        <PhotoUploader
          imageUrls={values.image_urls}
          onAddUrl={addImageUrl}
          onMoveUrl={moveImageUrl}
          onRemoveUrl={removeImageUrl}
          profileId={profile?.id ?? null}
        />

        <button className="w-full rounded-full bg-blush-500 px-5 py-3 text-sm font-extrabold text-cream-50 shadow-glow" disabled={saving} type="submit">
          {saving ? 'Saving profile…' : 'Save profile'}
        </button>
      </form>

      <div className="xl:sticky xl:top-6 xl:self-start">
        <ProfilePreviewSurface profile={previewProfile} />
      </div>
    </div>
  );
}

function ProfilePreviewSurface({ profile }: { profile: JaredProfile }) {
  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-4 shadow-card backdrop-blur-xl">
      <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">Live normal-card preview</p>
      <div className="scale-[0.92] origin-top">
        <JaredProfilePreview profile={profile} />
      </div>
    </section>
  );
}

function Field({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="mt-4 text-sm font-extrabold text-ink-600">
      <p>{label}</p>
      <span className="mt-2 block">{children}</span>
    </div>
  );
}

function Toggle({ checked, label, onChange }: { checked: boolean; label: string; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-ink-600">
      <input checked={checked} onChange={(event) => onChange(event.target.checked)} type="checkbox" />
      {label}
    </label>
  );
}

function createInitialValues(profile: JaredProfile | null): JaredProfileFormValues {
  return {
    slug: profile?.slug ?? '',
    internal_label: profile?.internal_label ?? '',
    display_name: profile?.display_name ?? 'Jared',
    age_label: profile?.age_label ?? '30-ish',
    location: profile?.location ?? 'Oakland',
    bio: profile?.bio ?? '',
    prompts: parsePrompts(profile?.prompts),
    tags: profile?.tags ?? [],
    image_urls: profile?.image_urls ?? [],
    sort_order: profile?.sort_order ?? 100,
    demo_eligible: profile?.demo_eligible ?? false,
    active: profile?.active ?? false,
    archived: profile?.archived ?? false
  };
}

function parsePrompts(prompts: Json | undefined): PromptRow[] {
  if (!Array.isArray(prompts)) {
    return [DEFAULT_PROMPT];
  }

  const rows = prompts.flatMap((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) {
      return [];
    }

    return [{ prompt: String(item.prompt ?? ''), answer: String(item.answer ?? '') }];
  });

  return rows.length ? rows : [DEFAULT_PROMPT];
}

function serializeValues(values: JaredProfileFormValues): JaredProfileInsert {
  return {
    ...values,
    prompts: serializePrompts(values.prompts)
  };
}

function serializePrompts(prompts: PromptRow[]): Json {
  return prompts.filter((row) => row.prompt.trim() || row.answer.trim());
}

const fieldClassName = 'w-full rounded-full border border-blush-100 bg-cream-50/80 px-4 py-3 text-sm font-semibold text-ink-900 outline-none focus:border-blush-500';
