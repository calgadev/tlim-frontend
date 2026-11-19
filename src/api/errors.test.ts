import { describe, expect, it } from 'vitest';
import { AxiosError, AxiosHeaders } from 'axios';
import type { AxiosResponse } from 'axios';
import { getApiErrorMessage, getErrorStatus } from './errors';

function httpError(status: number, data?: unknown): AxiosError {
  const config = { headers: new AxiosHeaders() };
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse;
  return new AxiosError('Request failed', 'ERR_BAD_RESPONSE', config, null, response);
}

describe('getApiErrorMessage', () => {
  it('uses the backend message for client errors', () => {
    const err = httpError(400, { status: 400, error: 'Bad Request', message: 'Username already taken' });
    expect(getApiErrorMessage(err)).toBe('Username already taken');
  });

  it('falls back per status when the body is empty', () => {
    expect(getApiErrorMessage(httpError(403, ''))).toMatch(/permission/i);
    expect(getApiErrorMessage(httpError(409))).toMatch(/conflicts/i);
  });

  it('hides generic 5xx messages', () => {
    const err = httpError(500, { message: 'An unexpected error occurred' });
    expect(getApiErrorMessage(err)).toMatch(/unexpected error/i);
    expect(getApiErrorMessage(err)).not.toBe('An unexpected error occurred');
  });

  it('explains when the API is unreachable', () => {
    const err = new AxiosError('Network Error', 'ERR_NETWORK');
    expect(getApiErrorMessage(err)).toMatch(/cannot reach/i);
  });

  it('handles non-Axios errors', () => {
    expect(getApiErrorMessage(new Error('boom'))).toBe('boom');
    expect(getApiErrorMessage('weird', 'fallback')).toBe('fallback');
  });
});

describe('getErrorStatus', () => {
  it('returns the HTTP status or null', () => {
    expect(getErrorStatus(httpError(404))).toBe(404);
    expect(getErrorStatus(new Error('x'))).toBeNull();
  });
});
