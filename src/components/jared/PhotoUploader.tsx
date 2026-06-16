import { useRef, useState } from 'react';
import { getJaredProfilePhotoStoragePath, uploadJaredProfilePhoto } from '../../lib/storage';

type PhotoUploaderProps = {
  profileId: string | null;
  imageUrls: string[];
  onAddUrl: (url: string) => void;
  onRemoveUrl: (url: string) => void;
  onMoveUrl: (fromIndex: number, toIndex: number) => void;
};

export function PhotoUploader({
  profileId,
  imageUrls,
  onAddUrl,
  onRemoveUrl,
  onMoveUrl
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [manualUrl, setManualUrl] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  async function handleUpload(file: File | undefined) {
    if (!file) {
      return;
    }

    if (!profileId) {
      setStatus('Save the profile before uploading photos. You can paste image URLs now.');
      return;
    }

    setStatus('Uploading photo to Jared profile storage…');
    const result = await uploadJaredProfilePhoto(
      getJaredProfilePhotoStoragePath(profileId, file.name),
      file
    );

    if (result.error) {
      setStatus(result.error.message);
      return;
    }

    if (result.demoMode) {
      setStatus('Demo mode: upload skipped safely.');
      return;
    }

    if (result.data?.publicUrl) {
      onAddUrl(result.data.publicUrl);
      setStatus('Photo uploaded and added to this profile.');
    }
  }

  function addManualUrl() {
    const nextUrl = manualUrl.trim();

    if (!nextUrl) {
      return;
    }

    onAddUrl(nextUrl);
    setManualUrl('');
    setStatus('Image URL added. Save the profile to persist it.');
  }

  return (
    <section className="rounded-app border border-white/80 bg-white/84 p-5 shadow-card backdrop-blur-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.24em] text-blush-600">
            Photos
          </p>
          <h2 className="mt-2 font-display text-3xl font-semibold leading-none tracking-[-0.04em] text-merlot-900">
            Upload, reorder, or paste URLs.
          </h2>
        </div>
        <button
          className="rounded-full bg-blush-500 px-4 py-2 text-sm font-extrabold text-cream-50 shadow-glow"
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          Upload
        </button>
      </div>
      <input
        accept="image/*"
        className="hidden"
        onChange={(event) => void handleUpload(event.target.files?.[0])}
        ref={inputRef}
        type="file"
      />
      <div className="mt-5 flex gap-2">
        <input
          className="min-w-0 flex-1 rounded-full border border-blush-100 bg-cream-50/80 px-4 py-3 text-sm font-semibold text-ink-900 outline-none focus:border-blush-500"
          onChange={(event) => setManualUrl(event.target.value)}
          placeholder="https://… or /jared-profile-photos/photo.jpg"
          type="url"
          value={manualUrl}
        />
        <button
          className="rounded-full border border-blush-100 bg-cream-50/80 px-4 py-2 text-sm font-extrabold text-merlot-900"
          onClick={addManualUrl}
          type="button"
        >
          Add URL
        </button>
      </div>
      {status ? (
        <p className="mt-3 rounded-3xl border border-blush-100 bg-cream-50/80 p-3 text-sm font-semibold text-ink-600">
          {status}
        </p>
      ) : null}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {imageUrls.length ? (
          imageUrls.map((url, index) => (
            <article
              className="overflow-hidden rounded-3xl border border-blush-100 bg-cream-50/80"
              key={`${url}-${index}`}
            >
              <ProfilePhoto url={url} />
              <div className="flex flex-wrap gap-2 p-3">
                <button
                  className="rounded-full border border-blush-100 px-3 py-1 text-xs font-extrabold text-ink-600"
                  disabled={index === 0}
                  onClick={() => onMoveUrl(index, index - 1)}
                  type="button"
                >
                  Up
                </button>
                <button
                  className="rounded-full border border-blush-100 px-3 py-1 text-xs font-extrabold text-ink-600"
                  disabled={index === imageUrls.length - 1}
                  onClick={() => onMoveUrl(index, index + 1)}
                  type="button"
                >
                  Down
                </button>
                <button
                  className="rounded-full bg-merlot-900 px-3 py-1 text-xs font-extrabold text-cream-50"
                  onClick={() => onRemoveUrl(url)}
                  type="button"
                >
                  Remove
                </button>
              </div>
            </article>
          ))
        ) : (
          <PhotoPlaceholder />
        )}
      </div>
    </section>
  );
}

function ProfilePhoto({ url }: { url: string }) {
  return (
    <div className="relative h-40 bg-[radial-gradient(circle_at_25%_15%,rgba(255,212,200,0.82),transparent_34%),linear-gradient(145deg,rgba(244,111,100,0.34),rgba(42,28,34,0.96))]">
      <div className="absolute inset-0 flex items-center justify-center p-5 text-center text-xs font-extrabold uppercase leading-4 tracking-[0.18em] text-cream-50/86">
        Photo placeholder
      </div>
      <img
        alt="Jared profile upload"
        className="relative h-full w-full object-cover"
        onError={(event) => event.currentTarget.classList.add('hidden')}
        src={url}
      />
    </div>
  );
}

function PhotoPlaceholder() {
  return (
    <div className="flex h-40 items-center justify-center rounded-3xl border border-blush-100 bg-[radial-gradient(circle_at_25%_15%,rgba(255,212,200,0.82),transparent_34%),linear-gradient(145deg,rgba(244,111,100,0.34),rgba(42,28,34,0.96))] p-6 text-center text-sm font-extrabold uppercase leading-5 tracking-[0.18em] text-cream-50">
      No photos yet. The public card remains polished with the built-in gradient surface.
    </div>
  );
}
