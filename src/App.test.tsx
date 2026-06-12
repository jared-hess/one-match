import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { getQueuedSwipes, QUEUED_SWIPES_KEY, recordAnonymousSwipe, recordSwipe, VIEWED_COUNT_KEY } from './lib/swipes';
import { getSupabaseAvailability } from './lib/supabase';
import { createTestRouter } from './router';

describe('App', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders the DateJared route shell', () => {
    render(<RouterProvider router={createTestRouter(['/'])} />);

    expect(screen.getAllByText('DateJared').length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: /dating, optimized/i })).toBeInTheDocument();
    expect(screen.getByText(/focused discovery for exactly one person/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jared/i })).not.toBeInTheDocument();
  });

  it('renders the swipe route without requiring sign-in', async () => {
    render(<RouterProvider router={createTestRouter(['/swipe'])} />);

    expect(await screen.findByRole('heading', { name: /choose deliberately/i })).toBeInTheDocument();
    expect(screen.getByText(/likes do not open chat/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /waiting for Supabase keys/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jared/i })).not.toBeInTheDocument();
  });

  it('renders Jared profile details without internal labels or slugs', async () => {
    render(<RouterProvider router={createTestRouter(['/profile/fallback-jared-dinner-conversation'])} />);

    expect(await screen.findByRole('heading', { name: /jared, 30-ish/i })).toBeInTheDocument();
    expect(screen.getAllByText('Oakland').length).toBeGreaterThan(0);
    expect(screen.getByText(/good conversation, warm lighting/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dinner \/ conversation Jared/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/jared-dinner-conversation/i)).not.toBeInTheDocument();
  });

  it('does not create a Supabase client when public env is missing', () => {
    const availability = getSupabaseAvailability({});

    expect(availability.available).toBe(false);
    expect(availability.client).toBeNull();
    if (!availability.available) {
      expect(availability.reason).toMatch(/not configured/i);
    }
  });

  it('short-circuits swipe writes in demo mode', async () => {
    const result = await recordSwipe('jared-profile-id', 'right', { demoMode: true });

    expect(result.demoMode).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it('queues anonymous right and super swipes locally while counting all viewed profiles', () => {
    recordAnonymousSwipe('profile-left', 'left');
    recordAnonymousSwipe('profile-right', 'right');
    recordAnonymousSwipe('profile-super', 'super');

    expect(getQueuedSwipes()).toEqual([
      expect.objectContaining({ jaredProfileId: 'profile-right', direction: 'right' }),
      expect.objectContaining({ jaredProfileId: 'profile-super', direction: 'super' })
    ]);
    expect(JSON.parse(window.localStorage.getItem(QUEUED_SWIPES_KEY) ?? '[]')).toHaveLength(2);
    expect(JSON.parse(window.localStorage.getItem(VIEWED_COUNT_KEY) ?? '0')).toBe(3);
  });
});
