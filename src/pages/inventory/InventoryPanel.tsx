import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Package, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useDeleteInventoryEntry, useInventory } from '@/hooks/useCharacters';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import type { RowTint } from '@/components/ui/Table';
import { formatDateTime, formatNumber } from '@/lib/format';
import type { CharacterResponse, InventoryResponse } from '@/types';
import { InventoryEntryModal } from './InventoryEntryModal';

function rowStatus(row: InventoryResponse): { tint: RowTint; badge: ReactNode } {
  if (row.deficit > 0) return { tint: 'warning', badge: <Badge variant="warning">Need {formatNumber(row.deficit)}</Badge> };
  if (row.targetQuantity > 0 && row.sellableQuantity > 0)
    return { tint: 'success', badge: <Badge variant="success">{formatNumber(row.sellableQuantity)} surplus</Badge> };
  if (row.targetQuantity === 0) return { tint: 'none', badge: <Badge variant="muted">No goal</Badge> };
  return { tint: 'none', badge: <Badge variant="default">On target</Badge> };
}

export function InventoryPanel({ character }: { character: CharacterResponse }) {
  const { data, error, isLoading, refetch } = useInventory(character.id);
  const remove = useDeleteInventoryEntry(character.id);
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [editing, setEditing] = useState<InventoryResponse | 'new' | null>(null);
  const [deleting, setDeleting] = useState<InventoryResponse | null>(null);

  const rows = useMemo(() => {
    const term = filter.trim().toLowerCase();
    const list = [...(data ?? [])].sort((a, b) => a.itemName.localeCompare(b.itemName));
    return term ? list.filter((r) => r.itemName.toLowerCase().includes(term)) : list;
  }, [data, filter]);

  const existingIds = useMemo(() => new Set((data ?? []).map((r) => r.itemId)), [data]);

  return (
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
        <div className="flex items-center gap-3">
          {data && <span className="text-sm text-fg-muted">{data.length} items</span>}
          <Button size="sm" onClick={() => setEditing('new')}>
            <Plus size={14} /> Add item
          </Button>
        </div>
      </div>

      {isLoading ? (
        <LoadingState rows={6} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => refetch()} />
      ) : !data?.length ? (
        <EmptyState
          icon={<Package size={36} />}
          title="The inventory is empty"
          description="Import a hunt to add its loot automatically, or add items by hand with a target quantity to keep."
          action={
            <Button size="sm" onClick={() => setEditing('new')}>
              <Plus size={14} /> Add item
            </Button>
          }
        />
      ) : rows.length === 0 ? (
        <EmptyState title="No items match the filter" />
      ) : (
        <Table>
          <THead>
            <tr>
              <Th>Item</Th>
              <Th align="right">Current</Th>
              <Th align="right">Target</Th>
              <Th>Status</Th>
              <Th className="hidden lg:table-cell">Updated</Th>
              <Th align="right">
                <span className="sr-only">Actions</span>
              </Th>
            </tr>
          </THead>
          <TBody>
            {rows.map((row) => {
              const status = rowStatus(row);
              return (
                <Tr key={row.id} tint={status.tint}>
                  <Td className="font-medium">{row.itemName}</Td>
                  <Td align="right" className="tabular-nums">
                    {formatNumber(row.currentQuantity)}
                  </Td>
                  <Td align="right" className="tabular-nums text-fg-secondary">
                    {row.targetQuantity ? formatNumber(row.targetQuantity) : '—'}
                  </Td>
                  <Td>{status.badge}</Td>
                  <Td className="hidden text-fg-muted lg:table-cell">{formatDateTime(row.updatedAt)}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="sm" onClick={() => setEditing(row)} aria-label={`Edit ${row.itemName}`}>
                        <Pencil size={14} />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setDeleting(row)} aria-label={`Remove ${row.itemName}`}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </TBody>
        </Table>
      )}

      {editing && (
        <InventoryEntryModal
          characterId={character.id}
          entry={editing === 'new' ? null : editing}
          existingIds={existingIds}
          onClose={() => setEditing(null)}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
        title={`Remove ${deleting?.itemName ?? 'item'}?`}
        description="The row is deleted from this character's inventory. Hunt sessions are not affected."
        confirmLabel="Remove"
        loading={remove.isPending}
        error={remove.error}
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(`${deleting.itemName} removed`);
              setDeleting(null);
            },
          })
        }
      />
    </Card>
  );
}
