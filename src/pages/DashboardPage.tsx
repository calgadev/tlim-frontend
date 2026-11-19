import { Link } from 'react-router-dom';
import { Coins, Plus, Tags, Upload, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveCharacter } from '@/contexts/ActiveCharacterContext';
import { useHuntSessions, useInventory, useSaleDecisions } from '@/hooks/useCharacters';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatHuntDate, formatGold, formatGoldShort, formatNumber } from '@/lib/format';
import { vocationLabel } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { CharacterResponse } from '@/types';

export function DashboardPage() {
  const { username } = useAuth();
  const { character, characters, isLoading } = useActiveCharacter();

  return (
    <>
      <PageHeader title={`Welcome back, ${username ?? 'adventurer'}`} description="What your last hunts earned and what to sell next." />
      {isLoading ? (
        <LoadingState variant="card" rows={4} />
      ) : !character ? (
        <Card>
          <EmptyState
            icon={<Users size={40} />}
            title="Create your first character"
            description="TLIM tracks loot, inventory and hunts per character, priced on the character's server."
            action={
              <ButtonLink to="/characters/new">
                <Plus size={16} /> New character
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <CharacterOverview character={character} otherCount={characters.length - 1} />
      )}
    </>
  );
}

function CharacterOverview({ character, otherCount }: { character: CharacterResponse; otherCount: number }) {
  const decisions = useSaleDecisions(character.id);
  const inventory = useInventory(character.id);
  const hunts = useHuntSessions(character.id);
  const recent = (hunts.data ?? []).slice(0, 5);
  const totalBalance = (hunts.data ?? []).reduce((sum, h) => sum + h.balance, 0);
  const toSell = (decisions.data?.items ?? []).filter((i) => i.decision === 'SELL_NPC' || i.decision === 'SELL_MARKET');

  return (
    <div className="flex flex-col gap-6">
      <Card className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-gradient text-xl font-bold text-gold-ink">
            {character.name[0]?.toUpperCase()}
          </div>
          <div>
            <Link to={`/characters/${character.id}`} className="text-lg font-semibold text-fg hover:text-gold-light">
              {character.name}
            </Link>
            <p className="text-sm text-fg-secondary">
              {vocationLabel(character.vocation)} · {character.serverName}
              {otherCount > 0 && <span className="text-fg-muted"> · switch character at the top right</span>}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonLink to={`/hunts/${character.id}/import`} size="sm">
            <Upload size={14} /> Import hunt
          </ButtonLink>
          <ButtonLink to={`/inventory/${character.id}/sell`} variant="secondary" size="sm">
            <Coins size={14} /> What to sell
          </ButtonLink>
          <ButtonLink to={`/prices/${character.serverId}?character=${character.id}`} variant="secondary" size="sm">
            <Tags size={14} /> Market prices
          </ButtonLink>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Passive gold"
          tone="gold"
          metric={decisions.data ? formatGoldShort(decisions.data.passiveGold) : '—'}
          trend={decisions.data ? `${toSell.length} items to sell` : undefined}
        />
        <StatCard
          label="Inventory value"
          metric={decisions.data ? formatGoldShort(decisions.data.grossValue) : '—'}
          trend={inventory.data ? `${formatNumber(inventory.data.length)} item types` : undefined}
        />
        <StatCard label="Hunts" metric={hunts.data ? formatNumber(hunts.data.length) : '—'} trend="imported sessions" />
        <StatCard
          label="Total balance"
          tone={totalBalance >= 0 ? 'success' : 'danger'}
          metric={hunts.data ? formatGoldShort(totalBalance) : '—'}
          trend="loot − supplies, all hunts"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card padded={false} className="lg:col-span-3">
          <CardHeader
            title="Recent hunts"
            actions={
              <Link to={`/hunts/${character.id}`} className="link-gold text-sm">
                All hunts
              </Link>
            }
            className="mb-0 p-6 pb-4"
          />
          {hunts.isLoading ? (
            <LoadingState rows={4} />
          ) : hunts.error ? (
            <ErrorState error={hunts.error} onRetry={() => hunts.refetch()} />
          ) : recent.length === 0 ? (
            <EmptyState
              title="No hunts yet"
              description="Paste a Hunt Analyser export to start the history."
              action={
                <ButtonLink to={`/hunts/${character.id}/import`} size="sm">
                  Import hunt
                </ButtonLink>
              }
            />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>Session</Th>
                  <Th>Location</Th>
                  <Th align="right">Balance</Th>
                </tr>
              </THead>
              <TBody>
                {recent.map((h) => (
                  <Tr key={h.id}>
                    <Td>
                      <Link to={`/hunts/session/${h.id}`} className="font-medium hover:text-gold-light">
                        {h.name}
                      </Link>
                      <div className="text-xs text-fg-muted">
                        {formatHuntDate(h.startedAt)} · {h.duration}
                      </div>
                    </Td>
                    <Td className="text-fg-secondary">{h.location ?? '—'}</Td>
                    <Td align="right" className={cn('font-medium tabular-nums', h.balance >= 0 ? 'text-success' : 'text-danger')}>
                      {formatGoldShort(h.balance)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>

        <Card padded={false} className="lg:col-span-2">
          <CardHeader
            title="Best sales"
            actions={
              <Link to={`/inventory/${character.id}/sell`} className="link-gold text-sm">
                All decisions
              </Link>
            }
            className="mb-0 p-6 pb-4"
          />
          {decisions.isLoading ? (
            <LoadingState rows={4} />
          ) : decisions.error ? (
            <ErrorState error={decisions.error} onRetry={() => decisions.refetch()} />
          ) : toSell.length === 0 ? (
            <EmptyState title="Nothing to sell" description="No item is above its target quantity." />
          ) : (
            <ul className="divide-y divide-white/[0.04]">
              {[...toSell]
                .sort((a, b) => b.estimatedValue - a.estimatedValue)
                .slice(0, 6)
                .map((i) => (
                  <li key={i.itemId} className="flex items-center justify-between gap-3 px-6 py-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium text-fg">{i.itemName}</p>
                      <p className="text-xs text-fg-muted">
                        {formatNumber(i.surplusQuantity)}× · {i.decision === 'SELL_NPC' ? 'NPC' : 'market'}
                      </p>
                    </div>
                    <span className="shrink-0 tabular-nums text-gold-light">{formatGold(i.estimatedValue)}</span>
                  </li>
                ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
