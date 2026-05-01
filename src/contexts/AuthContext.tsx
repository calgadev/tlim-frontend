import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from '@/types';

const AUTH_KEYS = ['token', 'username', 'role'] as const;

interface AuthState {
  token: string | null;
  username: string | null;
  role: 'USER' | 'ADMIN' | null;
}

interface AuthContextValue extends AuthState {
  login: (data: AuthResponse, rememberMe?: boolean) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    // localStorage is checked first (persistent); sessionStorage is the fallback
    // for sessions where "remember me" was unchecked.
    token: localStorage.getItem('token') ?? sessionStorage.getItem('token'),
    username: localStorage.getItem('username') ?? sessionStorage.getItem('username'),
    role: (localStorage.getItem('role') ?? sessionStorage.getItem('role')) as AuthState['role'],
  }));

  const login = (data: AuthResponse, rememberMe = true) => {
    // Trade-off: no refresh token mechanism (24h JWT expiry). Both localStorage and
    // sessionStorage are acceptable given the user must re-login after expiry either way.
    // rememberMe=true  → localStorage  (survives browser restarts)
    // rememberMe=false → sessionStorage (cleared when tab/browser closes)
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('token', data.token);
    storage.setItem('username', data.username);
    storage.setItem('role', data.role);
    setState({ token: data.token, username: data.username, role: data.role });
  };

  const logout = () => {
    // Remove specific keys rather than localStorage.clear() to avoid wiping
    // unrelated browser data stored by other origins or libraries.
    AUTH_KEYS.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
    setState({ token: null, username: null, role: null });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, isAdmin: state.role === 'ADMIN' }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
