import type { ReactNode } from 'react';

type PageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageShell({ eyebrow, title, description, children }: PageShellProps) {
  return (
    <section className="rounded-app border border-white/80 bg-white/78 p-6 shadow-card backdrop-blur-xl">
      <p className="text-xs font-bold uppercase tracking-[0.28em] text-blush-600">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-semibold leading-[0.98] tracking-[-0.04em] text-merlot-900">
        {title}
      </h1>
      <p className="mt-4 text-base leading-7 text-ink-600">{description}</p>
      {children ? <div className="mt-6">{children}</div> : null}
    </section>
  );
}
