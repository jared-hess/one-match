import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type PublicEnv = Partial<Record<'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY' | 'VITE_SITE_URL', string>>;

export type SupabaseAvailability =
  | {
      available: true;
      client: SupabaseClient;
      url: string;
    }
  | {
      available: false;
      client: null;
      reason: string;
    };

const PLACEHOLDER_VALUES = ['your-project', '<', '>', 'example', 'localhost:54321'];

let cachedAvailability: SupabaseAvailability | null = null;

function getEnvValue(env: PublicEnv, key: keyof PublicEnv): string {
  return env[key]?.trim() ?? '';
}

function isPlaceholder(value: string): boolean {
  const normalized = value.toLowerCase();
  return PLACEHOLDER_VALUES.some((placeholder) => normalized.includes(placeholder));
}

function isValidSupabaseUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.includes('supabase');
  } catch {
    return false;
  }
}

export function getSiteUrl(env: PublicEnv = import.meta.env): string {
  const configured = getEnvValue(env, 'VITE_SITE_URL');

  if (configured && !isPlaceholder(configured)) {
    return configured.replace(/\/$/, '');
  }

  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }

  return 'http://localhost:5173';
}

export function getAuthCallbackUrl(env: PublicEnv = import.meta.env): string {
  return `${getSiteUrl(env)}/auth/callback`;
}

export function getSupabaseAvailability(env: PublicEnv = import.meta.env): SupabaseAvailability {
  const supabaseUrl = getEnvValue(env, 'VITE_SUPABASE_URL');
  const anonKey = getEnvValue(env, 'VITE_SUPABASE_ANON_KEY');

  if (!supabaseUrl || !anonKey) {
    return {
      available: false,
      client: null,
      reason: 'Supabase is not configured yet. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable live auth and data.'
    };
  }

  if (isPlaceholder(supabaseUrl) || isPlaceholder(anonKey) || !isValidSupabaseUrl(supabaseUrl)) {
    return {
      available: false,
      client: null,
      reason: 'Supabase public environment values look like placeholders. Replace them with the project URL and anon key.'
    };
  }

  return {
    available: true,
    client: createClient(supabaseUrl, anonKey, {
      auth: {
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true
      }
    }),
    url: supabaseUrl
  };
}

export function getSupabase(): SupabaseAvailability {
  cachedAvailability ??= getSupabaseAvailability();
  return cachedAvailability;
}

export function resetSupabaseForTests(): void {
  cachedAvailability = null;
}
