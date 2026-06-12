import { beforeEach, describe, expect, it, vi } from 'vitest';
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
});
