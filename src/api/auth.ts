import client from './client';
import type { AuthResponse, LoginRequest, RegisterRequest } from '@/types';

export async function apiLogin(credentials: LoginRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/auth/login', credentials);
  return data;
}

export async function apiRegister(credentials: RegisterRequest): Promise<AuthResponse> {
  const { data } = await client.post<AuthResponse>('/api/auth/register', credentials);
  return data;
}
