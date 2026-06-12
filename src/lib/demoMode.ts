import type { MutationResult } from '../types';

export const DEMO_MODE_STORAGE_KEY = 'datejared:demo-mode';

export type DemoModeOptions = {
  demoMode?: boolean;
};

export function isDemoModeEnabled(options?: DemoModeOptions): boolean {
  if (options?.demoMode !== undefined) {
    return options.demoMode;
  }

  if (typeof window === 'undefined') {
    return false;
  }

  return window.localStorage.getItem(DEMO_MODE_STORAGE_KEY) === 'true';
}

export function setDemoModeEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DEMO_MODE_STORAGE_KEY, String(enabled));
}

export function createDemoMutationResult<T>(data: T | null = null): MutationResult<T> {
  return {
    data,
    error: null,
    demoMode: true
  };
}

export function createUnavailableMutationResult<T>(message: string): MutationResult<T> {
  return {
    data: null,
    error: new Error(message),
    demoMode: false
  };
}
