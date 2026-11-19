import { describe, expect, it } from 'vitest';
import { getTokenExpiry, readStoredAuth, writeStoredAuth } from './authStorage';
import { fakeJwt } from '@/test/render';

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

describe('getTokenExpiry', () => {
  it('reads the exp claim in milliseconds', () => {
    expect(getTokenExpiry(fakeJwt(1_800_000_000))).toBe(1_800_000_000_000);
  });

  it('returns null for malformed tokens', () => {
    expect(getTokenExpiry('not-a-jwt')).toBeNull();
    expect(getTokenExpiry('a.%%%.c')).toBeNull();
  });
});

describe('readStoredAuth', () => {
  it('restores a complete, unexpired session', () => {
    const token = fakeJwt(inOneHour());
    writeStoredAuth({ token, username: 'tester', role: 'USER' }, true);
    expect(readStoredAuth()).toEqual({ token, username: 'tester', role: 'USER' });
  });

  it('ignores an expired token', () => {
    writeStoredAuth({ token: fakeJwt(1_000), username: 'tester', role: 'USER' }, true);
    expect(readStoredAuth()).toBeNull();
  });

  it('ignores an unknown role', () => {
    localStorage.setItem('token', fakeJwt(inOneHour()));
    localStorage.setItem('username', 'tester');
    localStorage.setItem('role', 'SUPERUSER');
    expect(readStoredAuth()).toBeNull();
  });
});

describe('writeStoredAuth', () => {
  it('a tab-only login clears an older remembered session', () => {
    writeStoredAuth({ token: fakeJwt(inOneHour()), username: 'old', role: 'ADMIN' }, true);
    const fresh = fakeJwt(inOneHour() + 10);
    writeStoredAuth({ token: fresh, username: 'new', role: 'USER' }, false);

    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBe(fresh);
    expect(readStoredAuth()?.username).toBe('new');
  });
});
