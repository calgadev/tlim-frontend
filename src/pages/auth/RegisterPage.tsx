import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { InlineError } from '@/components/ui/States';
import { useAuth } from '@/contexts/AuthContext';
import { apiRegister } from '@/api/auth';
import { getApiErrorMessage } from '@/api/errors';
import { AuthLayout } from './AuthLayout';

// Mirrors RegisterRequest validation in tlim-java.
const schema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, 'Username must be at least 3 characters')
      .max(50, 'Username must be at most 50 characters')
      .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers and underscores are allowed'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be at most 100 characters'),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

type FormValues = z.infer<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: { username: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ username, password }) => {
    setError(null);
    try {
      // "Username already taken" is only revealed by the server on submit, never checked as you type.
      const data = await apiRegister({ username, password });
      login(data, true);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    }
  });

  return (
    <AuthLayout
      subtitle="Create your account"
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="link-gold">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input
          label="Username"
          placeholder="3–50 chars: letters, numbers, _"
          autoComplete="username"
          error={errors.username?.message}
          {...register('username')}
        />
        <Input
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label="Confirm password"
          type="password"
          placeholder="Repeat the password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <InlineError error={error} className="text-center" />
        <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
}
