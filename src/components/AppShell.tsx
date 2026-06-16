import { CalendarHeart } from 'lucide-react';
import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function AppShell() {
  return (
    <div className="min-h-screen overflow-hidden bg-cream-50 font-body text-ink-900">
      <div className="pointer-events-none fixed inset-x-[-35%] top-[-18%] h-96 rounded-full bg-blush-100 blur-3xl" />
      <div className="pointer-events-none fixed bottom-[-18%] right-[-45%] h-80 w-80 rounded-full bg-blush-500/20 blur-3xl" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md flex-col px-5 pb-32 pt-6">
        <header className="mb-7 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blush-500 text-cream-50 shadow-glow">
              <CalendarHeart className="h-5 w-5" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-blush-600">
                DateJared
              </p>
              <p className="text-sm text-ink-600">Private MVP foundation</p>
            </div>
          </div>
          <span className="rounded-full border border-blush-100 bg-white/70 px-3 py-1 text-xs font-semibold text-merlot-900 shadow-sm backdrop-blur">
            Shell
          </span>
        </header>
        <main className="relative z-10 flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
