import type { AuthResponse, Role } from '@/types';

// Kept unprefixed for compatibility with sessions created by earlier builds.
const KEYS = { token: 'token', username: 'username', role: 'role' } as const;

export interface StoredAuth {
  token: string;
  username: string;
  role: Role;
}

function read(key: string): string | null {
  try {
    // localStorage = "remember me"; sessionStorage = this tab only
    return localStorage.getItem(key) ?? sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function readStoredToken(): string | null {
  return read(KEYS.token);
}

/** Returns the stored session, or null if it is incomplete, malformed or expired. */
export function readStoredAuth(): StoredAuth | null {
  const token = read(KEYS.token);
  const username = read(KEYS.username);
  const role = read(KEYS.role);
  if (!token || !username || (role !== 'USER' && role !== 'ADMIN')) return null;
  const exp = getTokenExpiry(token);
  if (exp !== null && exp <= Date.now()) return null;
  return { token, username, role };
}

export function writeStoredAuth(data: AuthResponse, rememberMe: boolean) {
  // Clear both first so an old "remembered" token can never shadow a new tab-only session.
  clearStoredAuth();
  const storage = rememberMe ? localStorage : sessionStorage;
  try {
    storage.setItem(KEYS.token, data.token);
    storage.setItem(KEYS.username, data.username);
    storage.setItem(KEYS.role, data.role);
  } catch {
    // Storage unavailable (private mode, quota): the session lives in memory until reload.
  }
}

export function clearStoredAuth() {
  for (const key of Object.values(KEYS)) {
    try {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
}

/**
 * Reads the `exp` claim (ms since epoch) without verifying the signature. Used only to log the user
 * out on time; the backend still validates every token. Returns null if the token can't be parsed.
 */
export function getTokenExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}
