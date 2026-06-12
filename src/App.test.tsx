import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { recordSwipe } from './lib/swipes';
import { getSupabaseAvailability } from './lib/supabase';
import { createTestRouter } from './router';

describe('App', () => {
  it('renders the DateJared route shell', () => {
    render(<RouterProvider router={createTestRouter(['/'])} />);

    expect(screen.getByText('DateJared')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /careful foundation for one very specific match/i })).toBeInTheDocument();
    expect(screen.getByText(/swipe cards, Jared workflows, messaging, CMS, demo mode, and legal copy come in later tasks/i)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jared/i })).not.toBeInTheDocument();
  });

  it('renders the swipe route without requiring sign-in', () => {
    render(<RouterProvider router={createTestRouter(['/swipe'])} />);

    expect(screen.getByRole('heading', { name: /deck route exists/i })).toBeInTheDocument();
    expect(screen.getByText(/intentionally renders before sign-in/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /waiting for Supabase keys/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jared/i })).not.toBeInTheDocument();
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
});
