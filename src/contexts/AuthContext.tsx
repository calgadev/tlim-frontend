import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { AuthResponse } from '@/types';

interface AuthState {
  token: string | null;
  username: string | null;
  role: 'USER' | 'ADMIN' | null;
}

interface AuthContextValue extends AuthState {
  login: (data: AuthResponse) => void;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => ({
    token: localStorage.getItem('token'),
    username: localStorage.getItem('username'),
    role: localStorage.getItem('role') as AuthState['role'],
  }));

  const login = (data: AuthResponse) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    setState({ token: data.token, username: data.username, role: data.role });
  };

  const logout = () => {
    localStorage.clear();
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
