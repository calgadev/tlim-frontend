import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { GuestRoute, ProtectedRoute } from './ProtectedRoute';
import { fakeJwt, marker, renderWithRoutes } from '@/test/render';
import { writeStoredAuth } from '@/lib/authStorage';

const signIn = (role: 'USER' | 'ADMIN') =>
  writeStoredAuth({ token: fakeJwt(Math.floor(Date.now() / 1000) + 3600), username: 'tester', role }, true);

const routes = [
  { path: '/login', element: <GuestRoute>{marker('login')}</GuestRoute> },
  { path: '/dashboard', element: <ProtectedRoute>{marker('dashboard')}</ProtectedRoute> },
  { path: '/admin', element: <ProtectedRoute adminOnly>{marker('admin')}</ProtectedRoute> },
];

describe('route guards', () => {
  it('sends signed-out users to the login page', async () => {
    renderWithRoutes(routes, '/dashboard');
    expect(await screen.findByText('at:login')).toBeInTheDocument();
  });

  it('keeps regular users out of admin routes', async () => {
    signIn('USER');
    renderWithRoutes(routes, '/admin');
    expect(await screen.findByText('at:dashboard')).toBeInTheDocument();
  });

  it('lets admins in', async () => {
    signIn('ADMIN');
    renderWithRoutes(routes, '/admin');
    expect(await screen.findByText('at:admin')).toBeInTheDocument();
  });

  it('sends signed-in users away from the login page', async () => {
    signIn('USER');
    renderWithRoutes(routes, '/login');
    expect(await screen.findByText('at:dashboard')).toBeInTheDocument();
  });
});
