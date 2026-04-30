import { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGateProps {
  children: ReactNode;
  role?: 'ADMIN' | 'USER';
}

// UX convenience only — hides UI from non-matching roles.
// The backend enforces access on every endpoint; never treat this as a security boundary.
export function RoleGate({ children, role }: RoleGateProps) {
  // isAdmin is sourced exclusively from AuthContext (login API response), never from JWT decoding.
  const { isAdmin } = useAuth();

  if (role === 'ADMIN' && !isAdmin) return null;
  return <>{children}</>;
}
