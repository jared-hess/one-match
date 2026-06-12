import { Link } from 'react-router-dom';

type LikeSentToastProps = {
  visible: boolean;
};

export function LikeSentToast({ visible }: LikeSentToastProps) {
  if (!visible) {
    return null;
  }

  return (
    <div className="fixed inset-x-5 bottom-28 z-30 mx-auto max-w-md rounded-[1.75rem] border border-blush-100 bg-white/94 p-4 shadow-card backdrop-blur" role="status">
      <p className="text-sm font-extrabold text-merlot-900">Like sent.</p>
      <p className="mt-1 text-xs leading-5 text-ink-600">Nothing opens yet. If Jared matches back, messaging becomes available later.</p>
      <Link className="mt-3 inline-flex text-xs font-extrabold text-blush-600 underline underline-offset-4" to="/pending">
        View pending state
      </Link>
    </div>
  );
}
