import { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Bug, Search } from 'lucide-react';
import { useCreatures } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatNumber } from '@/lib/format';
import type { CreatureResponse } from '@/types';
import { CatalogHint } from './CatalogHint';

const PAGE = 100;

type Sort = 'name' | 'experience' | 'hp';
const sorters: Record<Sort, (a: CreatureResponse, b: CreatureResponse) => number> = {
  name: (a, b) => a.name.localeCompare(b.name),
  experience: (a, b) => (b.experience ?? -1) - (a.experience ?? -1),
  hp: (a, b) => (b.hp ?? -1) - (a.hp ?? -1),
};

export function CreaturesPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const query = params.get('q') ?? '';
  const sortParam = params.get('sort');
  const sort: Sort = sortParam === 'experience' || sortParam === 'hp' ? sortParam : 'name';
  const debounced = useDebouncedValue(query, 200);
  // The whole list is small enough (no loot attached) to filter on the client.
  const { data, error, isLoading, refetch } = useCreatures();

  const filtered = useMemo(() => {
    const term = debounced.trim().toLowerCase();
    const list = (data ?? []).filter((c) => !term || c.name.toLowerCase().includes(term));
    return list.sort(sorters[sort]);
  }, [data, debounced, sort]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  return (
    <>
      <PageHeader
        title="Creatures"
        back={{ to: '/wiki', label: 'Wiki' }}
        description={data ? `${formatNumber(data.length)} creatures in the catalog` : undefined}
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="relative w-full max-w-sm">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden />
            <input
              value={query}
              onChange={(e) => update('q', e.target.value)}
              placeholder="Filter by name…"
              aria-label="Filter by name"
              className="field-control h-10 pl-9"
              autoFocus
            />
          </div>
          <Select aria-label="Sort by" value={sort} onChange={(e) => update('sort', e.target.value === 'name' ? '' : e.target.value)} className="h-10 w-48">
            <option value="name">Name</option>
            <option value="experience">Most experience</option>
            <option value="hp">Most HP</option>
          </Select>
        </div>

        {isLoading ? (
          <LoadingState rows={8} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.length ? (
          <EmptyState icon={<Bug size={36} />} title="No creatures in the catalog" description={<CatalogHint what="creatures" />} />
        ) : !filtered.length ? (
          <EmptyState title="No creatures match the filter" />
        ) : (
          <>
            <Table>
              <THead>
                <tr>
                  <Th>Creature</Th>
                  <Th align="right">HP</Th>
                  <Th align="right">Experience</Th>
                </tr>
              </THead>
              <TBody>
                {filtered.slice(0, PAGE).map((c) => (
                  <Tr
                    key={c.id}
                    interactive
                    tabIndex={0}
                    onClick={() => navigate(`/wiki/creatures/${c.id}`)}
                    onKeyDown={(e) => e.key === 'Enter' && navigate(`/wiki/creatures/${c.id}`)}
                  >
                    <Td className="font-medium">{c.name}</Td>
                    <Td align="right" className="tabular-nums text-fg-secondary">
                      {formatNumber(c.hp)}
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {formatNumber(c.experience)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
            {filtered.length > PAGE && (
              <p className="border-t border-white/[0.06] px-4 py-3 text-center text-xs text-fg-muted">
                Showing {PAGE} of {formatNumber(filtered.length)}. Refine the filter to see others.
              </p>
            )}
          </>
        )}
      </Card>
    </>
  );
}
