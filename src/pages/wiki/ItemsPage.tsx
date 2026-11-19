import { useNavigate, useSearchParams } from 'react-router-dom';
import { Gem, Search } from 'lucide-react';
import { useItemSearch } from '@/hooks/useCatalog';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatGold } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ItemResponse } from '@/types';
import { CatalogHint } from './CatalogHint';

const LIMIT = 100;

function bestNpcPrice(item: ItemResponse): number | null {
  return item.npcBuyers.length ? Math.max(...item.npcBuyers.map((b) => b.price)) : null;
}

export function ItemsPage() {
  const navigate = useNavigate();
  // Search lives in the URL so the back button returns to the same results.
  const [params, setParams] = useSearchParams();
  const name = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const debouncedName = useDebouncedValue(name, 300);
  const debouncedCategory = useDebouncedValue(category, 300);
  const { data, error, isFetching, isLoading, refetch } = useItemSearch({
    name: debouncedName,
    category: debouncedCategory,
    limit: LIMIT,
  });

  const update = (key: 'q' | 'category', value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next, { replace: true });
  };

  const hasQuery = debouncedName.trim().length >= 2 || debouncedCategory.trim().length > 0;

  return (
    <>
      <PageHeader title="Items" back={{ to: '/wiki', label: 'Wiki' }} description="Category takes precedence over the name when both are filled." />
      <Card padded={false}>
        <div className="grid grid-cols-1 gap-3 border-b border-white/[0.06] p-4 md:grid-cols-2">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-[38px] text-fg-muted" aria-hidden />
            <Input
              label="Name contains"
              placeholder="e.g. dragon"
              value={name}
              onChange={(e) => update('q', e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <Input
            label="Exact category"
            placeholder="e.g. Creature Products"
            value={category}
            onChange={(e) => update('category', e.target.value)}
          />
        </div>

        {!hasQuery ? (
          <EmptyState icon={<Gem size={36} />} title="Search the item catalog" description="Type at least 2 letters of the name, or a category." />
        ) : isLoading ? (
          <LoadingState rows={8} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.length ? (
          <EmptyState title="No items found" description={<CatalogHint what="items" />} />
        ) : (
          <div className={cn('transition-opacity', isFetching && 'opacity-60')}>
            <Table>
              <THead>
                <tr>
                  <Th>Item</Th>
                  <Th>Category</Th>
                  <Th align="right">Weight</Th>
                  <Th align="right">Best NPC price</Th>
                  <Th>Flags</Th>
                </tr>
              </THead>
              <TBody>
                {data.map((item) => {
                  const best = bestNpcPrice(item);
                  return (
                    <Tr
                      key={item.id}
                      interactive
                      tabIndex={0}
                      onClick={() => navigate(`/wiki/items/${item.id}`)}
                      onKeyDown={(e) => e.key === 'Enter' && navigate(`/wiki/items/${item.id}`)}
                    >
                      <Td className="font-medium">{item.name}</Td>
                      <Td className="text-fg-secondary">{item.category ?? '—'}</Td>
                      <Td align="right" className="tabular-nums text-fg-secondary">
                        {item.weight === null ? '—' : `${item.weight} oz`}
                      </Td>
                      <Td align="right" className="tabular-nums">
                        {best === null ? <span className="text-fg-muted">no NPC</span> : formatGold(best)}
                      </Td>
                      <Td>
                        <ItemFlags item={item} />
                      </Td>
                    </Tr>
                  );
                })}
              </TBody>
            </Table>
            {data.length >= LIMIT && (
              <p className="border-t border-white/[0.06] px-4 py-3 text-center text-xs text-fg-muted">
                Showing the first {LIMIT} matches. Refine the search to see others.
              </p>
            )}
          </div>
        )}
      </Card>
    </>
  );
}

export function ItemFlags({ item }: { item: ItemResponse }) {
  return (
    <div className="flex flex-wrap gap-1">
      {item.isTaskItem && <Badge variant="gold">Task</Badge>}
      {item.isImbuementMaterial && <Badge variant="info">Imbuement</Badge>}
      {item.isQuestItem && <Badge variant="warning">Quest</Badge>}
      {item.isDeliveryItem && <Badge variant="muted">Delivery</Badge>}
    </div>
  );
}
