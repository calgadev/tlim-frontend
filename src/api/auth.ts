import client from './client';
import type { AuthResponse } from '@/types';

export async function apiLogin(credentials: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/auth/login', credentials);
  return data;
}

export async function apiRegister(credentials: {
  username: string;
  password: string;
}): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/auth/register', credentials);
  return data;
}
