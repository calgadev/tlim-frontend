import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Coins } from 'lucide-react';
import { useSaleDecisions } from '@/hooks/useCharacters';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { DECISIONS } from '@/lib/labels';
import { formatGold, formatGoldShort, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CharacterResponse, DecisionSort, SaleDecision } from '@/types';

type DecisionFilter = SaleDecision | 'ALL';

const FILTERS: { label: string; value: DecisionFilter }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Sell to NPC', value: 'SELL_NPC' },
  { label: 'Market', value: 'SELL_MARKET' },
  { label: 'No price', value: 'NO_PRICE' },
  { label: 'Keep', value: 'KEEP' },
];

export function SaleDecisionPanel({ character }: { character: CharacterResponse }) {
  const [filter, setFilter] = useState<DecisionFilter>('ALL');
  const [sortBy, setSortBy] = useState<DecisionSort | ''>('');
  const { data, error, isLoading, isFetching, refetch } = useSaleDecisions(character.id, {
    decision: filter === 'ALL' ? undefined : filter,
    sortBy: sortBy || undefined,
  });

  // Unfiltered numbers for the alert come from a separate (cached) query.
  const all = useSaleDecisions(character.id);
  const allItems = all.data?.items ?? [];
  const needsPrice = allItems.filter((i) => i.missingMarketPrice || i.decision === 'NO_PRICE');
  const toSell = allItems.filter((i) => i.decision === 'SELL_NPC' || i.decision === 'SELL_MARKET');
  const pricesLink = `/prices/${character.serverId}?character=${character.id}`;

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <StatCard
          label="Passive gold"
          tone="gold"
          metric={all.data ? formatGoldShort(all.data.passiveGold) : '—'}
          trend={all.data ? `${formatGold(all.data.passiveGold)} from selling the surplus` : undefined}
        />
        <StatCard
          label="Gross value"
          metric={all.data ? formatGoldShort(all.data.grossValue) : '—'}
          trend="Everything in the inventory at its best price"
        />
        <StatCard
          label="Items to sell"
          metric={all.data ? formatNumber(toSell.length) : '—'}
          trend={`Priced on ${character.serverName}`}
        />
      </div>

      {needsPrice.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/10 px-4 py-3">
          <p className="flex items-center gap-2 text-sm text-warning">
            <AlertTriangle size={16} aria-hidden />
            {needsPrice.length === 1 ? '1 item has' : `${needsPrice.length} items have`} no market price on{' '}
            {character.serverName}, so the decision may not be the best one.
          </p>
          <ButtonLink to={pricesLink} variant="secondary" size="sm">
            Set market prices
          </ButtonLink>
        </div>
      )}

      <Card padded={false}>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.06] p-4">
          <SegmentedToggle label="Decision" options={FILTERS} value={filter} onChange={setFilter} />
          <Select
            aria-label="Sort by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as DecisionSort | '')}
            className="h-10 w-48"
          >
            <option value="">Needs action first</option>
            <option value="value">Highest value</option>
            <option value="name">Name</option>
          </Select>
        </div>

        {isLoading ? (
          <LoadingState rows={6} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.items.length ? (
          <EmptyState
            icon={<Coins size={36} />}
            title={filter === 'ALL' ? 'Nothing to decide yet' : 'No items with this decision'}
            description={filter === 'ALL' ? 'Add items to the inventory or import a hunt first.' : undefined}
          />
        ) : (
          <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
            <Table>
              <THead>
                <tr>
                  <Th>Item</Th>
                  <Th align="right">Qty</Th>
                  <Th align="right">Goal</Th>
                  <Th align="right">Surplus</Th>
                  <Th align="right">NPC</Th>
                  <Th align="right">Market</Th>
                  <Th>Decision</Th>
                  <Th align="right">Value</Th>
                </tr>
              </THead>
              <TBody>
                {data.items.map((item) => {
                  const d = DECISIONS[item.decision];
                  return (
                    <Tr key={item.itemId}>
                      <Td>
                        <Link to={`/wiki/items/${item.itemId}`} className="font-medium hover:text-gold-light">
                          {item.itemName}
                        </Link>
                        {item.isTaskItem && (
                          <Badge variant="gold" className="ml-2">
                            Task
                          </Badge>
                        )}
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {formatNumber(item.quantity)}
                      </Td>
                      <Td align="right" className="tabular-nums text-fg-secondary">
                        {item.goalQuantity === null ? '—' : formatNumber(item.goalQuantity)}
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {formatNumber(item.surplusQuantity)}
                      </Td>
                      <Td align="right" className="tabular-nums text-fg-secondary">
                        {item.npcBuyable ? formatGold(item.bestNpcPrice) : '—'}
                      </Td>
                      <Td align="right" className="tabular-nums text-fg-secondary">
                        {item.marketPrice === null ? (
                          <Link to={pricesLink} className="text-warning hover:underline" title="No market price yet">
                            set
                          </Link>
                        ) : (
                          formatGold(item.marketPrice)
                        )}
                      </Td>
                      <Td>
                        <Badge variant={d.variant} title={d.hint}>
                          {d.label}
                        </Badge>
                      </Td>
                      <Td align="right" className="font-medium tabular-nums text-gold-light">
                        {item.estimatedValue ? formatGold(item.estimatedValue) : '—'}
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
