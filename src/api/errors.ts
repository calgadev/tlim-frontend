import { isAxiosError } from 'axios';
import type { ApiError } from '@/types';

const STATUS_FALLBACKS: Record<number, string> = {
  400: 'The request was invalid.',
  401: 'Your session has expired. Please sign in again.',
  403: "You don't have permission to do that.",
  404: 'Not found.',
  405: 'This action is not supported.',
  409: 'This conflicts with existing data.',
  502: 'An external service is unavailable. Try again later.',
};

export function getErrorStatus(err: unknown): number | null {
  return isAxiosError(err) ? (err.response?.status ?? null) : null;
}

/**
 * Turns any thrown value into a message for the UI.
 * The backend usually sends { status, error, message }, but some responses have an empty body
 * or no message (older builds, proxies), so every level falls back gracefully.
 */
export function getApiErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isAxiosError(err)) {
    return err instanceof Error && err.message ? err.message : fallback;
  }
  if (!err.response) {
    return err.code === 'ECONNABORTED'
      ? 'The server took too long to respond.'
      : 'Cannot reach the TLIM API. Is the backend running?';
  }
  const { status, data } = err.response;
  const message = (data as Partial<ApiError> | undefined)?.message;
  // Generic 500 messages are not more helpful than our own fallback.
  if (typeof message === 'string' && message.trim() && status < 500) return message;
  if (status >= 500 && status !== 502) return 'The server hit an unexpected error. Please try again.';
  return STATUS_FALLBACKS[status] ?? fallback;
}
