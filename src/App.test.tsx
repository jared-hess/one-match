import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DemoCompletionScreen } from './components/demo/DemoCompletionScreen';
import { DemoLauncher } from './components/demo/DemoLauncher';
import { DemoSwipeFlow } from './components/demo/DemoSwipeFlow';
import { InboundLikeCard } from './components/jared/InboundLikeCard';
import { InboundLikeDetail } from './components/jared/InboundLikeDetail';
import { JaredProfileForm } from './components/jared/JaredProfileForm';
import { JaredProfilePreview } from './components/jared/JaredProfilePreview';
import { RelationshipStatusBadge } from './components/jared/RelationshipStatusBadge';
import { ChatThread } from './components/messages/ChatThread';
import { fallbackJaredProfiles } from './data/jaredProfiles';
import {
  buildJaredDemoDeck,
  DEMO_MODE_STORAGE_KEY,
  endJaredDemoMode,
  getJaredDemoState,
  isDemoModeEnabled,
  JARED_DEMO_STATE_KEY,
  resetJaredDemoState
} from './lib/demoMode';
import { createJaredProfile } from './lib/jaredProfiles';
import { isMatchedOpenConversation, sendMessage } from './lib/messages';
import { addJaredNote, isProfileCompleteForJared, matchRelationshipBack } from './lib/relationships';
import { getJaredProfilePhotoStoragePath, JARED_PROFILE_PHOTOS_BUCKET, uploadJaredProfilePhoto } from './lib/storage';
import { getLocalSwipes, getQueuedSwipes, LOCAL_SWIPES_KEY, QUEUED_SWIPES_KEY, recordAnonymousSwipe, recordSwipe, VIEWED_COUNT_KEY } from './lib/swipes';
import { getSupabaseAvailability } from './lib/supabase';
import { createTestRouter } from './router';
import type { Conversation, InboundRelationshipContext, JaredProfileInsert, JaredProfileUpdate, Message, Relationship } from './types';

function createInboundContext(overrides: Partial<InboundRelationshipContext> = {}): InboundRelationshipContext {
  return {
    relationship: {
      id: 'relationship-id',
      user_id: 'user-id',
      jared_user_id: 'jared-user-id',
      status: 'pending',
      first_liked_profile_id: fallbackJaredProfiles[0].id,
      latest_liked_profile_id: fallbackJaredProfiles[1].id,
      decided_at: null,
      created_at: '2026-06-12T00:00:00.000Z',
      updated_at: '2026-06-12T00:00:00.000Z'
    },
    userProfile: {
      id: 'profile-id',
      user_id: 'user-id',
      email: null,
      role: 'user',
      display_name: 'Ari',
      city: 'Oakland',
      bio: 'Likes unhurried coffee.',
      looking_for: 'Warm conversation',
      good_first_date: 'A small table near a window',
      social_link: null,
      photo_urls: [],
      age_confirmed: true,
      onboarding_completed_at: null,
      created_at: '2026-06-12T00:00:00.000Z',
      updated_at: '2026-06-12T00:00:00.000Z'
    },
    likedProfiles: [fallbackJaredProfiles[0], fallbackJaredProfiles[1]],
    passedProfiles: [fallbackJaredProfiles[2]],
    firstLikedProfile: fallbackJaredProfiles[0],
    latestLikedProfile: fallbackJaredProfiles[1],
    notes: [],
    conversation: null,
    latestMessage: null,
    ...overrides
  };
}

function createRelationship(overrides: Partial<Relationship> = {}): Relationship {
  return {
    id: 'relationship-id',
    user_id: 'user-id',
    jared_user_id: 'jared-user-id',
    status: 'matched',
    first_liked_profile_id: fallbackJaredProfiles[0].id,
    latest_liked_profile_id: fallbackJaredProfiles[0].id,
    decided_at: '2026-06-12T00:00:00.000Z',
    created_at: '2026-06-12T00:00:00.000Z',
    updated_at: '2026-06-12T00:00:00.000Z',
    ...overrides
  };
}

function createConversation(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conversation-id',
    relationship_id: 'relationship-id',
    user_id: 'user-id',
    jared_user_id: 'jared-user-id',
    status: 'open',
    created_at: '2026-06-12T00:00:00.000Z',
    updated_at: '2026-06-12T00:00:00.000Z',
    ...overrides
  };
}

function createMessage(overrides: Partial<Message> = {}): Message {
  return {
    id: 'message-id',
    conversation_id: 'conversation-id',
    sender_id: 'user-id',
    body: 'Hi Jared',
    read_at: null,
    created_at: '2026-06-12T00:00:00.000Z',
    ...overrides
  };
}

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

  it('shows Jared inbound user photo context and no-photo fallback without changing liked counts', () => {
    const contextWithPhoto = createInboundContext({
      userProfile: {
        ...createInboundContext().userProfile!,
        photo_urls: ['/user-photo.jpg']
      }
    });

    const { rerender } = render(
      <MemoryRouter>
        <InboundLikeCard context={contextWithPhoto} />
      </MemoryRouter>
    );

    expect(screen.getByAltText(/ari profile/i)).toHaveAttribute('src', '/user-photo.jpg');
    expect(screen.getByText('2')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <InboundLikeCard context={createInboundContext()} />
      </MemoryRouter>
    );

    expect(screen.getByText(/no photo shared/i)).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows liked and passed Jared profile labels in inbound detail only', () => {
    render(
      <InboundLikeDetail
        context={createInboundContext()}
        decisionStatus="Choose a decision."
        onAddNote={async () => null}
        onDecide={async () => undefined}
      />
    );

    expect(screen.getByText(/liked: dinner \/ conversation jared, systems \/ software jared/i)).toBeInTheDocument();
    expect(screen.getByText(/passed: cooking \/ home jared/i)).toBeInTheDocument();
    expect(screen.getByText(/no photo shared/i)).toBeInTheDocument();
  });

  it('renders matched badges with readable light and dark variants', () => {
    render(
      <div>
        <RelationshipStatusBadge status="matched" />
        <RelationshipStatusBadge status="matched" tone="dark" />
      </div>
    );

    const badges = screen.getAllByText('Matched');
    expect(badges[0]).toHaveClass('text-merlot-900');
    expect(badges[1]).toHaveClass('text-cream-50');
  });

  it('short-circuits swipe writes in demo mode', async () => {
    const result = await recordSwipe('jared-profile-id', 'right', { demoMode: true });

    expect(result.demoMode).toBe(true);
    expect(result.error).toBeNull();
    expect(result.data).toBeNull();
  });

  it('renders CMS preview through the normal SwipeCard boundary', () => {
    render(
      <MemoryRouter>
        <JaredProfilePreview
          profile={{
            ...fallbackJaredProfiles[0],
            internal_label: 'Private CMS label must stay private',
            slug: 'private-cms-slug',
            display_name: 'Secret display name'
          }}
        />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: /jared, 30-ish/i })).toBeInTheDocument();
    expect(screen.getAllByText('Oakland')).not.toHaveLength(0);
    expect(screen.queryByText(/private cms label/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/private-cms-slug/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/secret display name/i)).not.toBeInTheDocument();
  });

  it('keeps CMS routes behind the existing Jared guard when Supabase is unavailable', () => {
    render(<RouterProvider router={createTestRouter(['/jared/profiles'])} />);

    expect(screen.getByText(/live datejared is waiting for supabase keys/i)).toBeInTheDocument();
    expect(screen.queryByText(/manage the swipe-deck versions of jared/i)).not.toBeInTheDocument();
  });

  it('targets the Jared profile photo bucket path helper without uploading in demo mode', async () => {
    const path = getJaredProfilePhotoStoragePath('profile-123', 'Jared Portrait.PNG', 12345);
    const file = new File(['photo'], 'Jared Portrait.PNG', { type: 'image/png' });
    const result = await uploadJaredProfilePhoto(path, file, { demoMode: true });

    expect(JARED_PROFILE_PHOTOS_BUCKET).toBe('jared-profile-photos');
    expect(path).toBe('profile-123/12345.png');
    expect(result.demoMode).toBe(true);
    expect(result.error).toBeNull();
  });

  it('keeps profile form active and archived states mutually consistent before submit', async () => {
    const submittedInputs: Array<JaredProfileInsert | JaredProfileUpdate> = [];
    const onSubmit = vi.fn(async (input: JaredProfileInsert | JaredProfileUpdate) => {
      submittedInputs.push(input);
    });

    render(
      <MemoryRouter>
        <JaredProfileForm onSubmit={onSubmit} profile={{ ...fallbackJaredProfiles[0], active: true, archived: false }} />
      </MemoryRouter>
    );

    const activeToggle = screen.getByLabelText(/active in deck/i);
    const archivedToggle = screen.getByLabelText(/archived/i);

    expect(activeToggle).toBeChecked();
    expect(archivedToggle).not.toBeChecked();

    fireEvent.click(archivedToggle);
    expect(activeToggle).not.toBeChecked();
    expect(archivedToggle).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(submittedInputs[0]).toEqual(expect.objectContaining({ active: false, archived: true }));

    fireEvent.click(activeToggle);
    expect(activeToggle).toBeChecked();
    expect(archivedToggle).not.toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /save profile/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(2));
    expect(submittedInputs[1]).toEqual(expect.objectContaining({ active: true, archived: false }));
  });

  it('reports unavailable safely for Jared profile creates without Supabase', async () => {
    const result = await createJaredProfile({
      slug: 'safe-unavailable-profile',
      internal_label: 'Safe unavailable profile',
      display_name: 'Jared',
      age_label: '30-ish',
      location: 'Oakland',
      bio: 'Safe unavailable path.',
      prompts: [],
      tags: [],
      image_urls: [],
      sort_order: 999,
      demo_eligible: false,
      active: false,
      archived: false
    });

    expect(result.demoMode).toBe(false);
    expect(result.data).toBeNull();
    expect(result.error?.message).toMatch(/supabase/i);
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

  it('keeps pending message threads non-interactive and shows required empty copy', () => {
    const pendingRelationship = createRelationship({ status: 'pending' });
    const conversation = createConversation();

    render(
      <ChatThread
        conversation={{ conversation, relationship: pendingRelationship, userProfile: null, latestMessage: null, unreadCount: 0 }}
        currentUserId="user-id"
        disabledReason="Messaging opens only after You and Jared matched."
        messages={[]}
        onRefresh={() => undefined}
        onSend={async () => undefined}
        statusText="Messaging opens only after You and Jared matched."
      />
    );

    expect(screen.getAllByText(/start the conversation/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/you and jared matched/i).length).toBeGreaterThan(0);
    expect(screen.getByPlaceholderText('Send a message...')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Send' })).toBeDisabled();
  });

  it('allows matched open conversation helpers and rejects duplicate-prone mismatches', async () => {
    const relationship = createRelationship();
    const conversation = createConversation();

    expect(isMatchedOpenConversation(relationship, conversation)).toBe(true);
    expect(isMatchedOpenConversation(createRelationship({ status: 'pending' }), conversation)).toBe(false);
    expect(isMatchedOpenConversation(relationship, createConversation({ status: 'archived' }))).toBe(false);
    expect(isMatchedOpenConversation(relationship, createConversation({ relationship_id: 'different-relationship' }))).toBe(false);

    const demoResult = await sendMessage(conversation.id, 'user-id', '  Hi Jared  ', { demoMode: true });
    expect(demoResult.demoMode).toBe(true);
    expect(demoResult.error).toBeNull();
  });

  it('aligns Jared replies opposite matched user messages', () => {
    const relationship = createRelationship();
    const conversation = createConversation();

    render(
      <ChatThread
        conversation={{ conversation, relationship, userProfile: createInboundContext().userProfile, latestMessage: null, unreadCount: 0 }}
        currentUserId="jared-user-id"
        disabledReason="Jared replies only when matched and open."
        messages={[createMessage(), createMessage({ id: 'jared-message-id', sender_id: 'jared-user-id', body: 'Hi Ari' })]}
        onRefresh={() => undefined}
        onSend={async () => undefined}
        statusText="Live updates are on for this conversation."
      />
    );

    expect(screen.getByText('Ari')).toBeInTheDocument();
    expect(screen.getByText('You')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Send a message...')).toBeEnabled();
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

  it('keeps Jared demo state isolated from normal anonymous swipe queues', () => {
    const state = resetJaredDemoState(7);
    const deck = buildJaredDemoDeck(
      [
        ...fallbackJaredProfiles,
        { ...fallbackJaredProfiles[0], id: 'private-ineligible', sort_order: 1, demo_eligible: false },
        { ...fallbackJaredProfiles[1], id: 'archived-ineligible', sort_order: 2, archived: true }
      ],
      7
    );

    expect(state.deckSize).toBe(7);
    expect(deck).toHaveLength(7);
    expect(deck.every((profile) => profile.demo_eligible && profile.active && !profile.archived)).toBe(true);
    expect(window.localStorage.getItem(JARED_DEMO_STATE_KEY)).toContain('"deckSize":7');
    expect(window.localStorage.getItem(LOCAL_SWIPES_KEY)).toBeNull();
    expect(window.localStorage.getItem(QUEUED_SWIPES_KEY)).toBeNull();
    expect(window.localStorage.getItem(VIEWED_COUNT_KEY)).toBeNull();
  });

  it('enables demo mode for reset but disables global no-write mode when ended', () => {
    resetJaredDemoState(10);

    expect(isDemoModeEnabled()).toBe(true);
    expect(window.localStorage.getItem(DEMO_MODE_STORAGE_KEY)).toBe('true');
    expect(window.localStorage.getItem(JARED_DEMO_STATE_KEY)).not.toBeNull();

    const endedState = endJaredDemoMode();

    expect(endedState.deckSize).toBe(5);
    expect(isDemoModeEnabled()).toBe(false);
    expect(window.localStorage.getItem(DEMO_MODE_STORAGE_KEY)).toBe('false');
    expect(window.localStorage.getItem(JARED_DEMO_STATE_KEY)).toBeNull();
  });

  it('does not silently force normal mutations into demo mode after End Demo', async () => {
    resetJaredDemoState(5);
    endJaredDemoMode();

    const result = await recordSwipe('jared-profile-id', 'right');

    expect(result.demoMode).toBe(false);
    expect(result.error?.message).toMatch(/supabase is not configured/i);
  });

  it('renders deck size choices and resets local demo state instantly', () => {
    const onDeckSizeChange = vi.fn((deckSize) => resetJaredDemoState(deckSize));

    render(<DemoLauncher availableProfiles={10} deckSize={5} onDeckSizeChange={onDeckSizeChange} onStart={() => undefined} />);

    fireEvent.click(screen.getByRole('button', { name: /7 cards/i }));

    expect(onDeckSizeChange).toHaveBeenCalledWith(7);
    expect(getJaredDemoState().deckSize).toBe(7);
    expect(screen.getByRole('button', { name: /5 cards/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /10 cards/i })).toBeInTheDocument();
  });

  it('keeps the Jared demo route behind the existing Jared guard when Supabase is unavailable', () => {
    render(<RouterProvider router={createTestRouter(['/jared/demo'])} />);

    expect(screen.getByText(/live datejared is waiting for supabase keys/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /launch demo/i })).not.toBeInTheDocument();
  });

  it('shows demo completion copy and share capability status', () => {
    const onEndDemo = vi.fn();
    const onShare = vi.fn();

    render(
      <MemoryRouter>
        <DemoCompletionScreen canShare={false} onEndDemo={onEndDemo} onShare={onShare} shareStatus="Share Link is unavailable in this browser." />
      </MemoryRouter>
    );

    expect(screen.getByText('Demo complete')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /candidate pool evaluation complete/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /end demo/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /open public app/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: /share link/i })).toBeDisabled();
    expect(screen.getByRole('status')).toHaveTextContent(/unavailable/i);
  });

  it('runs the End Demo completion action and clears global demo mode', () => {
    resetJaredDemoState(7);

    render(
      <MemoryRouter>
        <DemoCompletionScreen canShare={false} onEndDemo={endJaredDemoMode} onShare={() => undefined} shareStatus="Share Link is unavailable in this browser." />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /end demo/i }));

    expect(isDemoModeEnabled()).toBe(false);
    expect(window.localStorage.getItem(JARED_DEMO_STATE_KEY)).toBeNull();
  });

  it('reveals candidate similarity after exactly two demo card views without normal queue writes', async () => {
    const state = resetJaredDemoState(5);

    render(
      <MemoryRouter>
        <DemoSwipeFlow
          canShare={false}
          onComplete={() => undefined}
          onEndDemo={() => undefined}
          onShare={() => undefined}
          profiles={fallbackJaredProfiles.slice(0, 3)}
          shareStatus="Share unavailable."
          state={state}
        />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /like/i }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /pass/i }));

    expect(await screen.findByRole('dialog')).toHaveTextContent(/candidate similarity elevated/i);
    expect(getJaredDemoState().similarityRevealed).toBe(true);
    expect(window.localStorage.getItem(LOCAL_SWIPES_KEY)).toBeNull();
    expect(window.localStorage.getItem(QUEUED_SWIPES_KEY)).toBeNull();
    expect(window.localStorage.getItem(VIEWED_COUNT_KEY)).toBeNull();
  });
});
