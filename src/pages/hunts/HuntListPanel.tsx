import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Swords, Upload } from 'lucide-react';
import { useHuntSessions } from '@/hooks/useCharacters';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatHuntDateTime, formatGoldShort, formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CharacterResponse } from '@/types';

export function HuntListPanel({ character }: { character: CharacterResponse }) {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const debounced = useDebouncedValue(location, 300);
  const { data, error, isLoading, isFetching, refetch } = useHuntSessions(character.id, debounced);
  const importLink = `/hunts/${character.id}/import`;

  return (
    <Card padded={false}>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-4">
        <div className="relative w-full max-w-xs">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Filter by location…"
            aria-label="Filter by location"
            className="field-control h-10 pl-9"
          />
        </div>
        <ButtonLink to={importLink} size="sm">
          <Upload size={14} /> Import hunt
        </ButtonLink>
      </div>

      {isLoading ? (
        <LoadingState rows={5} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data?.length ? (
        debounced.trim() ? (
          <EmptyState title="No hunts at this location" description={`Nothing matches “${debounced.trim()}”.`} />
        ) : (
          <EmptyState
            icon={<Swords size={36} />}
            title="No hunts yet"
            description="Paste a Hunt Analyser export from the Tibia client. Its loot is added to the inventory automatically."
            action={
              <ButtonLink to={importLink} size="sm">
                <Upload size={14} /> Import your first hunt
              </ButtonLink>
            }
          />
        )
      ) : (
        <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
          <Table>
            <THead>
              <tr>
                <Th>Session</Th>
                <Th>Location</Th>
                <Th align="right">Duration</Th>
                <Th align="right">XP</Th>
                <Th align="right">Loot</Th>
                <Th align="right">Supplies</Th>
                <Th align="right">Balance</Th>
              </tr>
            </THead>
            <TBody>
              {data.map((s) => (
                <Tr
                  key={s.id}
                  interactive
                  onClick={() => navigate(`/hunts/session/${s.id}`)}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/hunts/session/${s.id}`)}
                  tabIndex={0}
                >
                  <Td>
                    <div className="font-medium">{s.name}</div>
                    <div className="text-xs text-fg-muted">{formatHuntDateTime(s.startedAt)}</div>
                  </Td>
                  <Td className="text-fg-secondary">
                    {s.location ?? '—'}
                    {s.isParty && (
                      <Badge variant="info" className="ml-2">
                        Party
                      </Badge>
                    )}
                  </Td>
                  <Td align="right" className="tabular-nums text-fg-secondary">
                    {s.duration}
                  </Td>
                  <Td align="right" className="tabular-nums">
                    {formatNumber(s.xpWithBonus)}
                  </Td>
                  <Td align="right" className="tabular-nums">
                    {formatGoldShort(s.lootTotal)}
                  </Td>
                  <Td align="right" className="tabular-nums text-fg-secondary">
                    {formatGoldShort(s.supplies)}
                  </Td>
                  <Td
                    align="right"
                    className={cn('font-medium tabular-nums', s.balance >= 0 ? 'text-success' : 'text-danger')}
                  >
                    {formatGoldShort(s.balance)}
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        </div>
      )}
    </Card>
  );
}
