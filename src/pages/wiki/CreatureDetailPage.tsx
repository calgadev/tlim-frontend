import { Link, useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useCreature } from '@/hooks/useCatalog';
import { getErrorStatus } from '@/api/errors';
import { Badge } from '@/components/ui/Badge';
import type { BadgeVariant } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatNumber, parseId } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { CreatureResponse } from '@/types';

const ELEMENTS: { key: keyof CreatureResponse; label: string }[] = [
  { key: 'physicalResistance', label: 'Physical' },
  { key: 'fireResistance', label: 'Fire' },
  { key: 'iceResistance', label: 'Ice' },
  { key: 'energyResistance', label: 'Energy' },
  { key: 'earthResistance', label: 'Earth' },
  { key: 'deathResistance', label: 'Death' },
  { key: 'holyResistance', label: 'Holy' },
  { key: 'drownResistance', label: 'Drown' },
];

/** Values are TibiaWiki damage modifiers: % of damage taken (100 = normal, 0 = immune). */
function modifierStyle(value: number): { variant: BadgeVariant; label: string; bar: string } {
  if (value === 0) return { variant: 'danger', label: 'Immune', bar: 'bg-danger' };
  if (value < 100) return { variant: 'warning', label: 'Resistant', bar: 'bg-warning' };
  if (value > 100) return { variant: 'success', label: 'Weak', bar: 'bg-success' };
  return { variant: 'muted', label: 'Neutral', bar: 'bg-fg-muted' };
}

export function CreatureDetailPage() {
  const id = parseId(useParams().id);
  if (id === null) return <NotFound />;
  return <CreatureDetail id={id} />;
}

function NotFound() {
  return (
    <Card>
      <EmptyState title="Creature not found" action={<ButtonLink to="/wiki/creatures">Back to creatures</ButtonLink>} />
    </Card>
  );
}

function CreatureDetail({ id }: { id: number }) {
  const { data: c, error, isLoading, refetch } = useCreature(id);
  if (isLoading) return <LoadingState variant="card" rows={4} />;
  if (error) return getErrorStatus(error) === 404 ? <NotFound /> : <ErrorState error={error} onRetry={() => refetch()} />;
  if (!c) return null;

  const elements = ELEMENTS.map((e) => ({ ...e, value: c[e.key] as number | null })).filter((e) => e.value !== null);
  const loot = [...c.loot].sort((a, b) => a.itemName.localeCompare(b.itemName));

  return (
    <>
      <PageHeader
        back={{ to: '/wiki/creatures', label: 'Creatures' }}
        title={
          <span className="flex items-center gap-3">
            {c.imageUrl && <img src={c.imageUrl} alt="" className="h-10 w-10 object-contain" referrerPolicy="no-referrer" />}
            {c.name}
          </span>
        }
        actions={
          c.wikiUrl && (
            <a href={c.wikiUrl} target="_blank" rel="noopener noreferrer" className="link-gold inline-flex items-center gap-1 text-sm">
              TibiaWiki <ExternalLink size={14} aria-hidden />
            </a>
          )
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Hit points" metric={formatNumber(c.hp)} />
        <StatCard label="Experience" tone="gold" metric={formatNumber(c.experience)} />
        <StatCard label="XP per HP" metric={c.hp && c.experience ? (c.experience / c.hp).toFixed(2) : '—'} />
        <StatCard label="Loot entries" metric={formatNumber(c.loot.length)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader title="Damage taken" description="% of normal damage per element. Above 100% is a weakness." />
          {elements.length ? (
            <ul className="flex flex-col gap-3">
              {elements.map((e) => {
                const s = modifierStyle(e.value!);
                return (
                  <li key={e.key} className="text-sm">
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span className="text-fg">{e.label}</span>
                      <span className="flex items-center gap-2">
                        <span className="tabular-nums text-fg-secondary">{e.value}%</span>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                      <div className={cn('h-full rounded-full', s.bar)} style={{ width: `${Math.min(e.value! / 2, 100)}%` }} />
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-sm text-fg-muted">No damage modifiers recorded.</p>
          )}
        </Card>

        <Card padded={false} className="lg:col-span-3">
          <CardHeader title="Loot" className="mb-0 p-6 pb-4" />
          {loot.length ? (
            <Table>
              <THead>
                <tr>
                  <Th>Item</Th>
                  <Th align="right">Amount</Th>
                  <Th>Rarity</Th>
                </tr>
              </THead>
              <TBody>
                {loot.map((l) => (
                  <Tr key={l.id}>
                    <Td>
                      <Link to={`/wiki/items/${l.itemId}`} className="hover:text-gold-light">
                        {l.itemName}
                      </Link>
                    </Td>
                    <Td align="right" className="tabular-nums text-fg-secondary">
                      {l.minAmount === l.maxAmount ? l.minAmount : `${l.minAmount}–${l.maxAmount}`}
                    </Td>
                    <Td className="capitalize text-fg-secondary">{l.rarity ?? '—'}</Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="No loot recorded" />
          )}
        </Card>
      </div>
    </>
  );
}
