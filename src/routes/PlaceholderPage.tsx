import { useParams } from 'react-router-dom';
import { PageShell } from '../components/PageShell';

export type PlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  note: string;
};

export function PlaceholderPage({ eyebrow, title, description, note }: PlaceholderPageProps) {
  const params = useParams();
  const paramEntries = Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1]));

  return (
    <PageShell eyebrow={eyebrow} title={title} description={description}>
      <div className="space-y-3">
        <p className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4 text-sm leading-6 text-ink-600">{note}</p>
        {paramEntries.length ? (
          <dl className="rounded-3xl border border-white/80 bg-white/70 p-4 text-sm text-ink-600">
            {paramEntries.map(([key, value]) => (
              <div className="flex justify-between gap-4" key={key}>
                <dt className="font-bold text-merlot-900">{key}</dt>
                <dd className="truncate">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </PageShell>
  );
}
