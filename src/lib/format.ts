const numberFormat = new Intl.NumberFormat('en-US');
const dateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const dateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
// tlim-java stores the Hunt Analyser's wall-clock times as if they were UTC, so they are shown in UTC
// to match what the player saw in the game client (not shifted to the browser's time zone).
const huntDateTimeFormat = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'UTC',
});
const huntDateFormat = new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' });

export function formatNumber(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : numberFormat.format(value);
}

/** Full gold amount, e.g. "1,234,567 gp". */
export function formatGold(value: number | null | undefined): string {
  return value === null || value === undefined ? '—' : `${numberFormat.format(value)} gp`;
}

/** Tibia-style short amount: 1,500 → "1.5k", 2,300,000 → "2.3kk". */
export function formatGoldShort(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  const abs = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  const trim = (n: number) => n.toFixed(n >= 100 ? 0 : 1).replace(/\.0$/, '');
  if (abs >= 1_000_000_000) return `${sign}${trim(abs / 1_000_000_000)}kkk`;
  if (abs >= 1_000_000) return `${sign}${trim(abs / 1_000_000)}kk`;
  if (abs >= 10_000) return `${sign}${trim(abs / 1_000)}k`;
  return numberFormat.format(value);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateTimeFormat.format(d);
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : dateFormat.format(d);
}

/** Hunt session start/end, as shown by the Hunt Analyser. */
export function formatHuntDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : huntDateTimeFormat.format(d);
}

export function formatHuntDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : huntDateFormat.format(d);
}

/** Elapsed time between two ISO instants, e.g. "3m 12s". */
export function formatElapsed(fromIso: string, toIso?: string | null): string {
  const ms = (toIso ? new Date(toIso).getTime() : Date.now()) - new Date(fromIso).getTime();
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${sec}s`;
  return `${sec}s`;
}

/** Converts a form string to an optional integer: '' → null. */
export function toOptionalInt(value: string | undefined | null): number | null {
  const trimmed = value?.trim() ?? '';
  return trimmed === '' ? null : Number.parseInt(trimmed, 10);
}

/** Parses a positive integer route param; null when absent or malformed. */
export function parseId(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value)) return null;
  const id = Number(value);
  return id > 0 && Number.isSafeInteger(id) ? id : null;
}
