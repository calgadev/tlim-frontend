import { useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, Search, Tags, X } from 'lucide-react';
import { useServer } from '@/hooks/useCatalog';
import { useCharacter, useSaleDecisions, useServerPrices, useSetServerPrice } from '@/hooks/useCharacters';
import { getApiErrorMessage, getErrorStatus } from '@/api/errors';
import { useToast } from '@/components/ui/Toast';
import { ItemPicker } from '@/components/ItemPicker';
import type { PickedItem } from '@/components/ItemPicker';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatGold, parseId } from '@/lib/format';
import { pvpLabel } from '@/lib/labels';
import type { ServerResponse } from '@/types';

export function PricesPage() {
  const serverId = parseId(useParams().serverId);
  const server = useServer(serverId);

  if (serverId === null || getErrorStatus(server.error) === 404) {
    return (
      <Card>
        <EmptyState title="Server not found" action={<ButtonLink to="/servers">Back to servers</ButtonLink>} />
      </Card>
    );
  }
  if (server.isLoading) return <LoadingState rows={6} />;
  if (server.error) return <ErrorState error={server.error} onRetry={() => server.refetch()} />;
  return server.data ? <Prices server={server.data} /> : null;
}

/** Parses a price input: '' → null (not set); otherwise a non-negative integer. */
function parsePrice(raw: string): { ok: true; value: number | null } | { ok: false; error: string } {
  const v = raw.trim().replace(/[,\s]/g, '');
  if (v === '') return { ok: true, value: null };
  if (!/^\d+$/.test(v)) return { ok: false, error: 'Whole number of gold, 0 or more' };
  const n = Number(v);
  if (!Number.isSafeInteger(n)) return { ok: false, error: 'Too large' };
  return { ok: true, value: n };
}

function Prices({ server }: { server: ServerResponse }) {
  const [params] = useSearchParams();
  const characterId = parseId(params.get('character') ?? undefined);
  const { data, error, isLoading, refetch } = useServerPrices(server.id);
  const [filter, setFilter] = useState('');

  const rows = useMemo(() => {
    const term = filter.trim().toLowerCase();
    const list = [...(data ?? [])].sort((a, b) => (a.itemName ?? '').localeCompare(b.itemName ?? ''));
    return term ? list.filter((r) => (r.itemName ?? '').toLowerCase().includes(term)) : list;
  }, [data, filter]);

  return (
    <>
      <PageHeader
        back={{ to: '/servers', label: 'Servers' }}
        title={`Market prices on ${server.name}`}
        description={
          <>
            {pvpLabel(server.pvpType)}
            {server.location ? ` · ${server.location}` : ''} · Shared by every player on this server. Leave empty for
            “not set”; 0 means the item is worthless on the market.
          </>
        }
      />

      <div className="flex flex-col gap-6">
        {characterId !== null && <MissingPrices serverId={server.id} characterId={characterId} />}

        <AddPrice serverId={server.id} />

        <Card padded={false}>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.06] p-4">
            <div className="relative w-full max-w-xs">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden />
              <input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter items…"
                aria-label="Filter items"
                className="field-control h-10 pl-9"
              />
            </div>
            {data && <span className="text-sm text-fg-muted">{data.length} prices</span>}
          </div>
          {isLoading ? (
            <LoadingState rows={6} />
          ) : error ? (
            <ErrorState error={error} onRetry={() => refetch()} />
          ) : !data?.length ? (
            <EmptyState icon={<Tags size={36} />} title="No market prices yet" description="Add the first one above." />
          ) : !rows.length ? (
            <EmptyState title="No items match the filter" />
          ) : (
            <Table>
              <THead>
                <tr>
                  <Th>Item</Th>
                  <Th>Current</Th>
                  <Th>New price (gp)</Th>
                </tr>
              </THead>
              <TBody>
                {rows.map((row) => (
                  <Tr key={row.id}>
                    <Td className="font-medium">
                      <Link to={`/wiki/items/${row.itemId}`} className="hover:text-gold-light">
                        {row.itemName ?? `Item #${row.itemId}`}
                      </Link>
                    </Td>
                    <Td>
                      <PriceBadge price={row.marketPrice} />
                    </Td>
                    <Td>
                      <PriceEditor serverId={server.id} itemId={row.itemId} itemName={row.itemName} current={row.marketPrice} />
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          )}
        </Card>
      </div>
    </>
  );
}

function PriceBadge({ price }: { price: number | null }) {
  if (price === null) return <Badge variant="warning">Not set</Badge>;
  if (price === 0) return <Badge variant="muted">0 gp · worthless</Badge>;
  return <span className="tabular-nums text-fg">{formatGold(price)}</span>;
}

/** Inline editor: Enter or ✓ saves, × clears the price (back to "not set"). */
function PriceEditor({
  serverId,
  itemId,
  itemName,
  current,
}: {
  serverId: number;
  itemId: number;
  itemName: string | null;
  current: number | null;
}) {
  const save = useSetServerPrice(serverId);
  const toast = useToast();
  const [value, setValue] = useState(current === null ? '' : String(current));
  const [error, setError] = useState<string | null>(null);
  const parsed = parsePrice(value);
  const dirty = parsed.ok ? parsed.value !== current : true;

  const submit = (next: number | null) =>
    save.mutate(
      { itemId, marketPrice: next },
      {
        onSuccess: () => {
          setError(null);
          setValue(next === null ? '' : String(next));
          toast.success(`${itemName ?? 'Price'}: ${next === null ? 'price cleared' : formatGold(next)}`);
        },
        onError: (err) => setError(getApiErrorMessage(err)),
      }
    );

  const onSave = () => {
    if (!parsed.ok) return setError(parsed.error);
    submit(parsed.value);
  };

  return (
    <div>
      <div className="flex items-center gap-1">
        <input
          value={value}
          inputMode="numeric"
          placeholder="not set"
          aria-label={`Market price of ${itemName ?? 'item'}`}
          onChange={(e) => {
            setValue(e.target.value);
            setError(null);
          }}
          onKeyDown={(e) => e.key === 'Enter' && dirty && onSave()}
          className="field-control h-9 w-36 tabular-nums"
        />
        <Button size="sm" variant="secondary" onClick={onSave} disabled={!dirty} loading={save.isPending} aria-label="Save price">
          <Check size={14} />
        </Button>
        {current !== null && (
          <Button size="sm" variant="ghost" onClick={() => submit(null)} disabled={save.isPending} aria-label="Clear price" title="Clear (not set)">
            <X size={14} />
          </Button>
        )}
      </div>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}

function AddPrice({ serverId }: { serverId: number }) {
  const save = useSetServerPrice(serverId);
  const toast = useToast();
  const [item, setItem] = useState<PickedItem | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onAdd = () => {
    if (!item) return setError('Choose an item');
    const parsed = parsePrice(value);
    if (!parsed.ok) return setError(parsed.error);
    if (parsed.value === null) return setError('Enter a price');
    save.mutate(
      { itemId: item.id, marketPrice: parsed.value },
      {
        onSuccess: () => {
          toast.success(`${item.name}: ${formatGold(parsed.value)}`);
          setItem(null);
          setValue('');
          setError(null);
        },
        onError: (err) => setError(getApiErrorMessage(err)),
      }
    );
  };

  return (
    <Card>
      <CardHeader title="Add or update a price" description="Setting a price for an item already listed replaces it." />
      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-[1fr_200px_auto]">
        <ItemPicker value={item} onChange={(i) => { setItem(i); setError(null); }} />
        <Input
          label="Market price (gp)"
          inputMode="numeric"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(null); }}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <Button onClick={onAdd} loading={save.isPending}>
          Save price
        </Button>
      </div>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </Card>
  );
}

/** Opened from the sale decision view: the character's items that still need a market price here. */
function MissingPrices({ serverId, characterId }: { serverId: number; characterId: number }) {
  const character = useCharacter(characterId);
  const decisions = useSaleDecisions(characterId);

  if (character.isLoading || decisions.isLoading) return <LoadingState rows={3} />;
  // Not this user's character, or not on this server: the section just doesn't apply.
  if (!character.data || !decisions.data || decisions.data.serverId !== serverId) return null;

  const missing = decisions.data.items.filter((i) => i.missingMarketPrice || i.decision === 'NO_PRICE');

  return (
    <Card className="border-warning/30">
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-warning" aria-hidden />
            Missing prices for {character.data.name}
          </span>
        }
        description={
          missing.length
            ? 'Fill these in so the sale decision can compare NPC and market prices.'
            : 'All set: every item of this character has a market price.'
        }
        actions={
          <ButtonLink to={`/inventory/${characterId}/sell`} variant="secondary" size="sm">
            Back to sale decisions
          </ButtonLink>
        }
      />
      {missing.length > 0 && (
        <Table>
          <THead>
            <tr>
              <Th>Item</Th>
              <Th align="right">Best NPC price</Th>
              <Th>Market price (gp)</Th>
            </tr>
          </THead>
          <TBody>
            {missing.map((i) => (
              <Tr key={i.itemId}>
                <Td className="font-medium">{i.itemName}</Td>
                <Td align="right" className="tabular-nums text-fg-secondary">
                  {i.npcBuyable ? formatGold(i.bestNpcPrice) : 'no NPC'}
                </Td>
                <Td>
                  <PriceEditor serverId={serverId} itemId={i.itemId} itemName={i.itemName} current={i.marketPrice} />
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </Card>
  );
}
