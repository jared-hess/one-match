import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createOwnDeletionRequest, fetchDeletionRequestsForJared, fetchOwnDeletionRequests, updateDeletionRequestForJared } from './deletionRequests';
import { fetchOwnProfile } from './profiles';
import { fetchOwnRelationships } from './relationships';

const mockGetSupabase = vi.hoisted(() => vi.fn());

vi.mock('./supabase', () => ({
  getSupabase: mockGetSupabase
}));

describe('own data access', () => {
  beforeEach(() => {
    mockGetSupabase.mockReset();
  });

  it('filters fetchOwnProfile by the authenticated user id', async () => {
    const maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } }, error: null });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: {
        auth: { getUser },
        from
      },
      url: 'https://example.supabase.co'
    });

    await fetchOwnProfile();

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith('profiles');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-123');
    expect(maybeSingle).toHaveBeenCalledTimes(1);
  });

  it('returns null from fetchOwnProfile before querying profiles when signed out', async () => {
    const from = vi.fn();
    const getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: {
        auth: { getUser },
        from
      },
      url: 'https://example.supabase.co'
    });

    await expect(fetchOwnProfile()).resolves.toBeNull();
    expect(from).not.toHaveBeenCalled();
  });

  it('filters fetchOwnRelationships by the authenticated user id', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-456' } }, error: null });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: {
        auth: { getUser },
        from
      },
      url: 'https://example.supabase.co'
    });

    await fetchOwnRelationships();

    expect(getUser).toHaveBeenCalledTimes(1);
    expect(from).toHaveBeenCalledWith('relationships');
    expect(select).toHaveBeenCalledWith('*');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-456');
    expect(order).toHaveBeenCalledWith('updated_at', { ascending: false });
  });

  it('creates deletion requests through the backend RPC for signed-in users', async () => {
    const request = { id: 'request-1', user_id: 'user-789', status: 'requested' };
    const rpc = vi.fn().mockResolvedValue({ data: request, error: null });
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-789' } }, error: null });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: {
        auth: { getUser },
        rpc
      },
      url: 'https://example.supabase.co'
    });

    await expect(createOwnDeletionRequest()).resolves.toMatchObject({ data: request, error: null, demoMode: false });
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(rpc).toHaveBeenCalledWith('request_deletion');
  });

  it('does not write deletion requests when Supabase is unavailable', async () => {
    mockGetSupabase.mockReturnValue({
      available: false,
      client: null,
      reason: 'Supabase missing.'
    });

    await expect(createOwnDeletionRequest()).resolves.toMatchObject({
      data: null,
      demoMode: false
    });
  });

  it('does not call deletion RPC when the current user is signed out', async () => {
    const rpc = vi.fn();
    const getUser = vi.fn().mockResolvedValue({ data: { user: null }, error: null });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: {
        auth: { getUser },
        rpc
      },
      url: 'https://example.supabase.co'
    });

    await expect(createOwnDeletionRequest()).resolves.toMatchObject({
      data: null,
      demoMode: false
    });
    expect(getUser).toHaveBeenCalledTimes(1);
    expect(rpc).not.toHaveBeenCalled();
  });

  it('filters own deletion request list by the authenticated user id', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const getUser = vi.fn().mockResolvedValue({ data: { user: { id: 'user-101' } }, error: null });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: {
        auth: { getUser },
        from
      },
      url: 'https://example.supabase.co'
    });

    await fetchOwnDeletionRequests();

    expect(from).toHaveBeenCalledWith('deletion_requests');
    expect(eq).toHaveBeenCalledWith('user_id', 'user-101');
    expect(order).toHaveBeenCalledWith('requested_at', { ascending: false });
  });

  it('lets Jared list deletion requests through the table policy boundary', async () => {
    const order = vi.fn().mockResolvedValue({ data: [], error: null });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: { from },
      url: 'https://example.supabase.co'
    });

    await fetchDeletionRequestsForJared();

    expect(from).toHaveBeenCalledWith('deletion_requests');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('requested_at', { ascending: false });
  });

  it('sets completion timestamps and clears cancellation timestamps on Jared updates', async () => {
    const single = vi.fn().mockResolvedValue({ data: null, error: null });
    const select = vi.fn().mockReturnValue({ single });
    const eq = vi.fn().mockReturnValue({ select });
    const update = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ update });

    mockGetSupabase.mockReturnValue({
      available: true,
      client: { from },
      url: 'https://example.supabase.co'
    });

    await updateDeletionRequestForJared('request-2', { status: 'completed', notes: 'Handled in Supabase.' });

    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'completed',
        notes: 'Handled in Supabase.',
        cancelled_at: null,
        completed_at: expect.any(String)
      })
    );
    expect(eq).toHaveBeenCalledWith('id', 'request-2');
  });
});
