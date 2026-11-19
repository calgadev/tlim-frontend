import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import * as authApi from '@/api/auth';
import { fakeJwt, marker, renderWithRoutes } from '@/test/render';
import { LoginPage } from './LoginPage';
import { RegisterPage } from './RegisterPage';

const routes = [
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/dashboard', element: marker('dashboard') },
];

function http401(): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response = { status: 401, data: { message: 'Invalid credentials' }, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('Unauthorized', 'ERR_BAD_REQUEST', config, null, response);
}

describe('RegisterPage', () => {
  it('validates like the backend before calling it', async () => {
    const register = vi.spyOn(authApi, 'apiRegister');
    const user = userEvent.setup();
    renderWithRoutes(routes, '/register');

    await user.type(screen.getByLabelText('Username'), 'ab!');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.type(screen.getByLabelText('Confirm password'), 'other');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Only letters, numbers and underscores are allowed')).toBeInTheDocument();
    expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('shows the server message (e.g. username taken)', async () => {
    const config = { headers: new AxiosHeaders() };
    const response = { status: 400, data: { message: 'Username already taken' }, statusText: '', headers: {}, config } as AxiosResponse;
    vi.spyOn(authApi, 'apiRegister').mockRejectedValue(new AxiosError('Bad Request', 'ERR_BAD_REQUEST', config, null, response));
    const user = userEvent.setup();
    renderWithRoutes(routes, '/register');

    await user.type(screen.getByLabelText('Username'), 'tester');
    await user.type(screen.getByLabelText('Password'), 'long-enough');
    await user.type(screen.getByLabelText('Confirm password'), 'long-enough');
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByText('Username already taken')).toBeInTheDocument();
  });
});

describe('LoginPage', () => {
  it('shows a friendly message on wrong credentials', async () => {
    vi.spyOn(authApi, 'apiLogin').mockRejectedValue(http401());
    const user = userEvent.setup();
    renderWithRoutes(routes, '/login');

    await user.type(screen.getByLabelText('Username'), 'tester');
    await user.type(screen.getByLabelText('Password'), 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });

  it('stores a tab-only session without "remember me" and opens the dashboard', async () => {
    const token = fakeJwt(Math.floor(Date.now() / 1000) + 3600);
    vi.spyOn(authApi, 'apiLogin').mockResolvedValue({ token, username: 'tester', role: 'USER' });
    const user = userEvent.setup();
    renderWithRoutes(routes, '/login');

    await user.type(screen.getByLabelText('Username'), 'tester');
    await user.type(screen.getByLabelText('Password'), 'right-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('at:dashboard')).toBeInTheDocument();
    expect(sessionStorage.getItem('token')).toBe(token);
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('explains why the user landed here after a 401', async () => {
    renderWithRoutes(routes, '/login?expired=1');
    expect(await screen.findByText(/session has expired/i)).toBeInTheDocument();
  });
});
