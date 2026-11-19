import type { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGateProps {
  children: ReactNode;
  /** ADMIN: only admins see the children. USER: only non-admins do. */
  role: 'ADMIN' | 'USER';
  fallback?: ReactNode;
}

// UX convenience only: hides UI from non-matching roles.
// The backend enforces access on every endpoint; never treat this as a security boundary.
export function RoleGate({ children, role, fallback = null }: RoleGateProps) {
  const { isAdmin } = useAuth();
  const allowed = role === 'ADMIN' ? isAdmin : !isAdmin;
  return <>{allowed ? children : fallback}</>;
}
