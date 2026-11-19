import { describe, expect, it } from 'vitest';
import { formatGold, formatGoldShort, formatHuntDateTime, parseId, toOptionalInt } from './format';

describe('formatGoldShort', () => {
  it.each([
    [0, '0'],
    [9_999, '9,999'],
    [15_000, '15k'],
    [1_500_000, '1.5kk'],
    [250_000_000, '250kk'],
    [2_300_000_000, '2.3kkk'],
    [-3_064, '-3,064'],
    [-45_000, '-45k'],
  ])('%d → %s', (value, expected) => {
    expect(formatGoldShort(value)).toBe(expected);
  });

  it('shows a dash for missing values', () => {
    expect(formatGoldShort(null)).toBe('—');
    expect(formatGold(undefined)).toBe('—');
  });
});

describe('formatHuntDateTime', () => {
  it('keeps the Hunt Analyser wall-clock time instead of shifting to the local zone', () => {
    // tlim-java stores 18:13 from the analyser as 18:13Z
    expect(formatHuntDateTime('2026-01-23T18:13:14Z')).toContain('18:13');
  });
});

describe('parseId', () => {
  it('accepts positive integers only', () => {
    expect(parseId('42')).toBe(42);
    expect(parseId('0')).toBeNull();
    expect(parseId('-1')).toBeNull();
    expect(parseId('1.5')).toBeNull();
    expect(parseId('abc')).toBeNull();
    expect(parseId(undefined)).toBeNull();
  });
});

describe('toOptionalInt', () => {
  it('maps blank to null', () => {
    expect(toOptionalInt('')).toBeNull();
    expect(toOptionalInt('  ')).toBeNull();
    expect(toOptionalInt(' 250 ')).toBe(250);
  });
});
