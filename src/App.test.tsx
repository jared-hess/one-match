import { render, screen } from '@testing-library/react';
import { RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it } from 'vitest';
import { fallbackJaredProfiles } from './data/jaredProfiles';
import { addJaredNote, isProfileCompleteForJared, matchRelationshipBack } from './lib/relationships';
import { getLocalSwipes, getQueuedSwipes, LOCAL_SWIPES_KEY, QUEUED_SWIPES_KEY, recordAnonymousSwipe, recordSwipe, VIEWED_COUNT_KEY } from './lib/swipes';
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
    expect(screen.getByText(/focused discovery experience designed to reduce romantic decision fatigue/i)).toBeInTheDocument();
    expect(screen.queryByText(/exactly one person/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/browse Jared profiles/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jared/i })).not.toBeInTheDocument();
  });

  it('renders preferences without exposing a Jared-specific interest option', () => {
    render(<RouterProvider router={createTestRouter(['/preferences'])} />);

    expect(screen.getByText('Interested in')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Men' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /open to focused matches/i })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: /^Jared$/i })).not.toBeInTheDocument();
  });

  it('renders the swipe route without requiring sign-in', async () => {
    render(<RouterProvider router={createTestRouter(['/swipe'])} />);

    expect(await screen.findByRole('heading', { name: /choose deliberately/i })).toBeInTheDocument();
    expect(screen.getByText(/likes do not open chat/i)).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /waiting for Supabase keys/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /jared/i })).not.toBeInTheDocument();
  });

  it('renders Jared profile details without internal labels or slugs', async () => {
    render(<RouterProvider router={createTestRouter([`/profile/${fallbackJaredProfiles[0].id}`])} />);

    expect(await screen.findByRole('heading', { name: /jared, 30-ish/i })).toBeInTheDocument();
    expect(screen.getAllByText('Oakland').length).toBeGreaterThan(0);
    expect(screen.getByText(/good conversation, warm lighting/i)).toBeInTheDocument();
    expect(screen.queryByText(/Dinner \/ conversation Jared/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/jared-dinner-conversation/i)).not.toBeInTheDocument();
  });

  it('uses opaque fallback ids for normal profile links', async () => {
    render(<RouterProvider router={createTestRouter(['/swipe'])} />);

    const detailLink = await screen.findByRole('link', { name: /read the profile/i });
    expect(detailLink).toHaveAttribute('href', `/profile/${fallbackJaredProfiles[0].id}`);
    expect(fallbackJaredProfiles[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(detailLink.getAttribute('href')).not.toMatch(/jared-dinner-conversation|fallback-jared/i);
  });

  it('hardcodes the normal visible display name even if profile data changes', async () => {
    const originalName = fallbackJaredProfiles[0].display_name;
    fallbackJaredProfiles[0].display_name = 'Internal Alternate Name';

    render(<RouterProvider router={createTestRouter([`/profile/${fallbackJaredProfiles[0].id}`])} />);

    expect(await screen.findByRole('heading', { name: /jared, 30-ish/i })).toBeInTheDocument();
    expect(screen.queryByText(/Internal Alternate Name/i)).not.toBeInTheDocument();
    fallbackJaredProfiles[0].display_name = originalName;
  });

  it('does not create a Supabase client when public env is missing', () => {
    const availability = getSupabaseAvailability({});

    expect(availability.available).toBe(false);
    expect(availability.client).toBeNull();
    if (!availability.available) {
      expect(availability.reason).toMatch(/not configured/i);
    }
  });

  it('keeps Jared workspace routes behind the existing guard when Supabase is unavailable', async () => {
    render(<RouterProvider router={createTestRouter(['/jared'])} />);

    expect(await screen.findByRole('heading', { name: /live datejared is waiting for supabase keys/i })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: /private control room/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /open inbound likes/i })).not.toBeInTheDocument();
  });

  it('keeps Jared private notes unreachable from normal routes', () => {
    render(<RouterProvider router={createTestRouter(['/'])} />);

    expect(screen.queryByText(/private notes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/inbound detail/i)).not.toBeInTheDocument();
  });

  it('short-circuits swipe writes in demo mode', async () => {
    const result = await recordSwipe('jared-profile-id', 'right', { demoMode: true });

    expect(result.demoMode).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it('short-circuits Jared match-back and notes in demo/unavailable modes', async () => {
    const matchResult = await matchRelationshipBack('relationship-id', { demoMode: true });
    const noteResult = await addJaredNote('relationship-id', 'Remember the coffee context.');

    expect(matchResult.demoMode).toBe(true);
    expect(matchResult.error).toBeNull();
    expect(matchResult.data).toEqual({ relationship: null, conversation: null });
    expect(noteResult.demoMode).toBe(false);
    expect(noteResult.error?.message).toMatch(/supabase is not configured/i);
  });

  it('evaluates Jared-visible profile completion without exposing it to normal screens', () => {
    expect(
      isProfileCompleteForJared({
        id: 'profile-id',
        user_id: 'user-id',
        email: null,
        role: 'user',
        display_name: 'Ari',
        city: 'Oakland',
        bio: null,
        looking_for: null,
        good_first_date: null,
        social_link: null,
        photo_urls: [],
        age_confirmed: true,
        onboarding_completed_at: null,
        created_at: '2026-06-12T00:00:00.000Z',
        updated_at: '2026-06-12T00:00:00.000Z'
      })
    ).toBe(true);
    expect(isProfileCompleteForJared(null)).toBe(false);
  });

  it('stores all anonymous swipes locally while queueing only right and super likes', () => {
    recordAnonymousSwipe('profile-left', 'left');
    recordAnonymousSwipe('profile-right', 'right');
    recordAnonymousSwipe('profile-super', 'super');

    expect(getLocalSwipes()).toEqual([
      expect.objectContaining({ jaredProfileId: 'profile-left', direction: 'left' }),
      expect.objectContaining({ jaredProfileId: 'profile-right', direction: 'right' }),
      expect.objectContaining({ jaredProfileId: 'profile-super', direction: 'super' })
    ]);
    expect(getQueuedSwipes()).toEqual([
      expect.objectContaining({ jaredProfileId: 'profile-right', direction: 'right' }),
      expect.objectContaining({ jaredProfileId: 'profile-super', direction: 'super' })
    ]);
    expect(JSON.parse(window.localStorage.getItem(LOCAL_SWIPES_KEY) ?? '[]')).toHaveLength(3);
    expect(JSON.parse(window.localStorage.getItem(QUEUED_SWIPES_KEY) ?? '[]')).toHaveLength(2);
    expect(JSON.parse(window.localStorage.getItem(VIEWED_COUNT_KEY) ?? '0')).toBe(3);
  });
});
