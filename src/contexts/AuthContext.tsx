import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { AuthResponse, Role } from '@/types';
import { clearStoredAuth, getTokenExpiry, readStoredAuth, writeStoredAuth } from '@/lib/authStorage';

interface AuthState {
  token: string | null;
  username: string | null;
  role: Role | null;
}

interface AuthContextValue extends AuthState {
  /** rememberMe=true → localStorage (survives restarts); false → sessionStorage (this tab only) */
  login: (data: AuthResponse, rememberMe?: boolean) => void;
  logout: () => void;
  isAdmin: boolean;
}

const EMPTY: AuthState = { token: null, username: null, role: null };

// setTimeout overflows above ~24.8 days; the JWT lives 24 h, so this only guards odd configs.
const MAX_TIMER_MS = 2_147_483_647;

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [state, setState] = useState<AuthState>(() => readStoredAuth() ?? EMPTY);

  const login = useCallback(
    (data: AuthResponse, rememberMe = true) => {
      // Another user's cached data must never leak into this session.
      queryClient.clear();
      writeStoredAuth(data, rememberMe);
      setState({ token: data.token, username: data.username, role: data.role });
    },
    [queryClient]
  );

  const logout = useCallback(() => {
    clearStoredAuth();
    queryClient.clear();
    setState(EMPTY);
  }, [queryClient]);

  // No refresh token exists: end the session when the JWT expires instead of waiting for a 401.
  useEffect(() => {
    if (!state.token) return;
    const exp = getTokenExpiry(state.token);
    if (exp === null) return;
    const id = setTimeout(logout, Math.min(Math.max(exp - Date.now(), 0), MAX_TIMER_MS));
    return () => clearTimeout(id);
  }, [state.token, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({ ...state, login, logout, isAdmin: state.role === 'ADMIN' }),
    [state, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
