import { useState, FormEvent, ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { apiRegister } from '@/api/auth';

function validateUsername(value: string): string | null {
  if (value.length < 3) return 'Username must be at least 3 characters';
  if (value.length > 50) return 'Username must be at most 50 characters';
  if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Only letters, numbers, and underscores are allowed';
  return null;
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  function handleUsernameChange(e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    // Only surface format errors once the user has typed something.
    // "Username already taken" is deliberately NOT checked here — only the server 400
    // reveals it, to avoid leaking whether a username exists before submission.
    setUsernameError(value.length > 0 ? validateUsername(value) : null);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;

    const validationError = validateUsername(username);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setServerError(null);
    setLoading(true);
    try {
      const data = await apiRegister({ username, password });
      // Registration always creates a USER role; store persistently (rememberMe=true).
      login(data, true);
      // Always redirect to /dashboard — no ?redirect= param to prevent open redirect attacks.
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setServerError(message ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: '#08101C' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.10)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
        }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <h1
            className="text-2xl font-semibold tracking-tight"
            style={{ background: 'linear-gradient(135deg, #D9B35B, #F4D27A)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          >
            TLIM
          </h1>
          <p className="text-sm mt-1" style={{ color: '#64748B' }}>
            Create your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Input
              label="Username"
              name="username"
              type="text"
              placeholder="3–50 chars, letters, numbers, _"
              autoComplete="username"
              required
              onChange={handleUsernameChange}
            />
            {usernameError && (
              <p className="text-xs px-1" style={{ color: '#EF4444' }}>{usernameError}</p>
            )}
          </div>

          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Choose a password"
            autoComplete="new-password"
            required
          />

          {serverError && (
            <p className="text-sm text-center" style={{ color: '#EF4444' }}>{serverError}</p>
          )}

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium transition-opacity hover:opacity-75"
            style={{ color: '#D9B35B' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
