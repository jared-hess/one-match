import { Heart, MessageCircle, Settings, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: '/swipe', label: 'Swipe', icon: Heart },
  { to: '/match', label: 'Match', icon: Sparkles },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/settings', label: 'Settings', icon: Settings }
];

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 mx-auto max-w-md px-4 pb-4"
      aria-label="Primary navigation"
    >
      <div className="grid grid-cols-4 rounded-[1.75rem] border border-white/80 bg-white/86 p-2 shadow-card backdrop-blur-xl">
        {navItems.map((item) => (
          <NavLink
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[0.68rem] font-bold transition ${
                isActive
                  ? 'bg-blush-500 text-cream-50 shadow-glow'
                  : 'text-ink-600 hover:bg-blush-50 hover:text-merlot-900'
              }`
            }
            key={item.to}
            to={item.to}
          >
            <item.icon className="h-4 w-4" aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
