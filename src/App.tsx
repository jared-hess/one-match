import { motion } from 'framer-motion';
import { CalendarHeart, HeartHandshake, ShieldCheck } from 'lucide-react';

const highlights = [
  {
    icon: HeartHandshake,
    label: 'Curated introductions',
    detail: 'A focused matching space prepared for the DateJared MVP.'
  },
  {
    icon: ShieldCheck,
    label: 'Private by default',
    detail: 'Auth, data, and messaging screens will be layered in later tasks.'
  }
];

function App() {
  return (
    <main className="min-h-screen overflow-hidden bg-cream-50 font-body text-ink-900">
      <section className="relative isolate mx-auto flex min-h-screen w-full max-w-md flex-col px-5 py-6 sm:justify-center">
        <div className="absolute inset-x-[-35%] top-[-18%] -z-10 h-96 rounded-full bg-blush-100 blur-3xl" />
        <div className="absolute bottom-[-18%] right-[-45%] -z-10 h-80 w-80 rounded-full bg-blush-500/20 blur-3xl" />

        <motion.header
          className="mb-8 flex items-center justify-between"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blush-500 text-cream-50 shadow-glow">
              <CalendarHeart className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blush-600">DateJared</p>
              <p className="text-sm text-ink-600">MVP shell</p>
            </div>
          </div>
          <span className="rounded-full border border-blush-100 bg-white/70 px-3 py-1 text-xs font-semibold text-merlot-900 shadow-sm backdrop-blur">
            Preview
          </span>
        </motion.header>

        <motion.div
          className="rounded-app border border-white/80 bg-white/78 p-6 shadow-card backdrop-blur-xl"
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
        >
          <div className="mb-8 inline-flex rounded-full bg-blush-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.24em] text-blush-600">
            App foundation
          </div>
          <h1 className="font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-merlot-900">
            A warm start for intentional dating.
          </h1>
          <p className="mt-5 text-base leading-7 text-ink-600">
            DateJared is scaffolded as a mobile-first React app with routing, PWA support, Capacitor, and quality checks ready for focused product work.
          </p>

          <section className="mt-8 space-y-3" aria-label="Implementation placeholders">
            {highlights.map((item, index) => (
              <motion.article
                className="rounded-3xl border border-blush-100 bg-cream-50/80 p-4"
                key={item.label}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.45, delay: 0.25 + index * 0.08 }}
              >
                <div className="flex gap-3">
                  <item.icon className="mt-1 h-5 w-5 flex-none text-blush-600" aria-hidden="true" />
                  <div>
                    <h2 className="text-sm font-bold text-merlot-900">{item.label}</h2>
                    <p className="mt-1 text-sm leading-6 text-ink-600">{item.detail}</p>
                  </div>
                </div>
              </motion.article>
            ))}
          </section>
        </motion.div>
      </section>
    </main>
  );
}

export default App;
