import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Checkbox, Input } from '@/components/ui/Field';
import { InlineError } from '@/components/ui/States';
import { useAuth } from '@/contexts/AuthContext';
import { apiLogin } from '@/api/auth';
import { getApiErrorMessage, getErrorStatus } from '@/api/errors';
import { AuthLayout } from './AuthLayout';

const schema = z.object({
  username: z.string().trim().min(1, 'Enter your username'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { username: '', password: '', rememberMe: false },
  });

  const onSubmit = handleSubmit(async ({ username, password, rememberMe }) => {
    setError(null);
    try {
      const data = await apiLogin({ username, password });
      login(data, rememberMe);
      // Always /dashboard: never follow a ?redirect= param, to rule out open redirects.
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorStatus(err) === 401 ? 'Invalid username or password' : getApiErrorMessage(err));
    }
  });

  return (
    <AuthLayout
      subtitle="Tibia Loot & Inventory Manager"
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link to="/register" className="link-gold">
            Register
          </Link>
        </>
      }
    >
      {params.get('expired') && !error && (
        <p className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-center text-sm text-warning">
          Your session has expired. Please sign in again.
        </p>
      )}
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Username"
          placeholder="Enter your username"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Checkbox label="Remember me" {...register('rememberMe')} />
        <InlineError error={error} className="text-center" />
        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          {isSubmitting ? 'Signing in…' : 'Sign in'}
        </Button>
      </form>
    </AuthLayout>
  );
}
