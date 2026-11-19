import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/** Signed-in users only; adminOnly also requires the ADMIN role (the API enforces it as well). */
export function ProtectedRoute({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { token, isAdmin } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

/** Login and register are for signed-out users; anyone else goes to the dashboard. */
export function GuestRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
