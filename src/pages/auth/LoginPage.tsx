import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/contexts/AuthContext';
import { apiLogin } from '@/api/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const username = (form.elements.namedItem('username') as HTMLInputElement).value;
    const password = (form.elements.namedItem('password') as HTMLInputElement).value;
    const rememberMe = (form.elements.namedItem('rememberMe') as HTMLInputElement).checked;

    setError(null);
    setLoading(true);
    try {
      const data = await apiLogin({ username, password });
      login(data, rememberMe);
      // Always redirect to /dashboard — never follow a ?redirect= param to prevent open redirect attacks.
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } }).response?.status;
      setError(status === 401 ? 'Invalid username or password' : 'Something went wrong. Please try again.');
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
            Tibia Loot &amp; Inventory Manager
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Username"
            name="username"
            type="text"
            placeholder="Enter your username"
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />

          {/* Remember me + Forgot password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                name="rememberMe"
                className="rounded accent-[#D9B35B] w-4 h-4 cursor-pointer"
              />
              <span className="text-sm" style={{ color: '#94A3B8' }}>Remember me</span>
            </label>
            {/* Forgot password has no backend support — kept as a non-functional visual placeholder. */}
            <span
              className="text-sm"
              style={{ color: '#D9B35B', opacity: 0.45, cursor: 'default' }}
              title="Not yet available"
            >
              Forgot password?
            </span>
          </div>

          {error && (
            <p className="text-sm text-center" style={{ color: '#EF4444' }}>{error}</p>
          )}

          <Button type="submit" variant="primary" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: '#64748B' }}>
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-medium transition-opacity hover:opacity-75"
            style={{ color: '#D9B35B' }}
          >
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
