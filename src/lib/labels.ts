import type { PvpType, SaleDecision, ScraperStatus, Vocation } from '@/types';
import type { BadgeVariant } from '@/components/ui/Badge';

export const VOCATIONS: { value: Vocation; label: string }[] = [
  { value: 'EK', label: 'Elite Knight' },
  { value: 'MS', label: 'Master Sorcerer' },
  { value: 'ED', label: 'Elder Druid' },
  { value: 'RP', label: 'Royal Paladin' },
  { value: 'EM', label: 'Exalted Monk' },
];

export function vocationLabel(v: Vocation | null): string {
  return VOCATIONS.find((x) => x.value === v)?.label ?? 'No vocation';
}

export const PVP_TYPES: { value: PvpType; label: string }[] = [
  { value: 'OPTIONAL_PVP', label: 'Optional PvP' },
  { value: 'OPEN_PVP', label: 'Open PvP' },
  { value: 'RETRO_OPEN_PVP', label: 'Retro Open PvP' },
  { value: 'HARDCORE_PVP', label: 'Hardcore PvP' },
  { value: 'RETRO_HARDCORE_PVP', label: 'Retro Hardcore PvP' },
];

export function pvpLabel(p: PvpType): string {
  return PVP_TYPES.find((x) => x.value === p)?.label ?? p;
}

export const DECISIONS: Record<SaleDecision, { label: string; variant: BadgeVariant; hint: string }> = {
  SELL_NPC: { label: 'Sell to NPC', variant: 'success', hint: 'An NPC pays at least as much as the market' },
  SELL_MARKET: { label: 'Sell on market', variant: 'info', hint: 'The market pays more than any NPC' },
  NO_PRICE: { label: 'No price', variant: 'warning', hint: 'No NPC buys it and no market price is registered' },
  KEEP: { label: 'Keep', variant: 'muted', hint: 'Not above your target quantity' },
};

export const SCRAPER_STATUS: Record<ScraperStatus, { label: string; variant: BadgeVariant }> = {
  IDLE: { label: 'Idle', variant: 'muted' },
  RUNNING: { label: 'Running', variant: 'info' },
  COMPLETED: { label: 'Completed', variant: 'success' },
  FAILED: { label: 'Failed', variant: 'danger' },
};
