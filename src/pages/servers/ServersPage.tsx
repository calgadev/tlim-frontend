import { useMemo, useState } from 'react';
import { Globe, Pencil, Plus, Search, Tags, Trash2 } from 'lucide-react';
import { useDeleteServer, useServers } from '@/hooks/useCatalog';
import { useActiveCharacter } from '@/contexts/ActiveCharacterContext';
import { getErrorStatus } from '@/api/errors';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Checkbox } from '@/components/ui/Field';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { RoleGate } from '@/components/ui/RoleGate';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { PVP_TYPES, pvpLabel } from '@/lib/labels';
import type { PvpType, ServerResponse } from '@/types';
import { ServerFormModal } from './ServerFormModal';

export function ServersPage() {
  const [includeInactive, setIncludeInactive] = useState(false);
  const [query, setQuery] = useState('');
  const [pvp, setPvp] = useState<PvpType | ''>('');
  const [editing, setEditing] = useState<ServerResponse | 'new' | null>(null);
  const [deleting, setDeleting] = useState<ServerResponse | null>(null);
  const { data, error, isLoading, refetch } = useServers(includeInactive);
  const { characters } = useActiveCharacter();
  const remove = useDeleteServer();
  const toast = useToast();

  const myServers = useMemo(() => new Set(characters.map((c) => c.serverId)), [characters]);

  const rows = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (data ?? [])
      .filter((s) => (!term || s.name.toLowerCase().includes(term)) && (!pvp || s.pvpType === pvp))
      // Worlds with the user's characters first
      .sort((a, b) => Number(myServers.has(b.id)) - Number(myServers.has(a.id)) || a.name.localeCompare(b.name));
  }, [data, query, pvp, myServers]);

  return (
    <>
      <PageHeader
        title="Servers"
        description="The official Tibia worlds. Each has its own market prices, shared by all players."
        actions={
          <RoleGate role="ADMIN">
            <Button size="sm" onClick={() => setEditing('new')}>
              <Plus size={14} /> Add server
            </Button>
          </RoleGate>
        }
      />
      <Card padded={false}>
        <div className="flex flex-wrap items-center gap-3 border-b border-white/[0.06] p-4">
          <div className="relative w-full max-w-xs">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted" aria-hidden />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find a world…"
              aria-label="Find a world"
              className="field-control h-10 pl-9"
            />
          </div>
          <select
            value={pvp}
            onChange={(e) => setPvp(e.target.value as PvpType | '')}
            aria-label="PvP type"
            className="field-control h-10 w-48 cursor-pointer [&>option]:bg-overlay"
          >
            <option value="">All PvP types</option>
            {PVP_TYPES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          <Checkbox
            label="Show inactive worlds"
            checked={includeInactive}
            onChange={(e) => setIncludeInactive(e.target.checked)}
          />
          {data && <span className="ml-auto text-sm text-fg-muted">{rows.length} worlds</span>}
        </div>

        {isLoading ? (
          <LoadingState rows={8} />
        ) : error ? (
          <ErrorState error={error} onRetry={() => refetch()} />
        ) : !data?.length ? (
          <EmptyState
            icon={<Globe size={36} />}
            title="No servers yet"
            description="The world list is imported from TibiaData on the backend's first start. An admin can import it again from the admin panel."
            action={
              <RoleGate role="ADMIN">
                <ButtonLink to="/admin" size="sm">
                  Open admin panel
                </ButtonLink>
              </RoleGate>
            }
          />
        ) : !rows.length ? (
          <EmptyState title="No worlds match the filters" />
        ) : (
          <Table>
            <THead>
              <tr>
                <Th>World</Th>
                <Th>PvP type</Th>
                <Th>Location</Th>
                <Th align="right">
                  <span className="sr-only">Actions</span>
                </Th>
              </tr>
            </THead>
            <TBody>
              {rows.map((s) => (
                <Tr key={s.id}>
                  <Td>
                    <span className="font-medium">{s.name}</span>
                    {myServers.has(s.id) && (
                      <Badge variant="gold" className="ml-2">
                        Your character
                      </Badge>
                    )}
                    {!s.active && (
                      <Badge variant="muted" className="ml-2" title="No longer in the official list">
                        Inactive
                      </Badge>
                    )}
                  </Td>
                  <Td className="text-fg-secondary">{pvpLabel(s.pvpType)}</Td>
                  <Td className="text-fg-secondary">{s.location ?? '—'}</Td>
                  <Td align="right">
                    <div className="flex justify-end gap-1">
                      <ButtonLink to={`/prices/${s.id}`} variant="ghost" size="sm">
                        <Tags size={14} /> Prices
                      </ButtonLink>
                      <RoleGate role="ADMIN">
                        <Button variant="ghost" size="sm" onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`}>
                          <Pencil size={14} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setDeleting(s)} aria-label={`Delete ${s.name}`}>
                          <Trash2 size={14} />
                        </Button>
                      </RoleGate>
                    </div>
                  </Td>
                </Tr>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      {editing && <ServerFormModal server={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={deleting !== null}
        onClose={() => {
          setDeleting(null);
          remove.reset();
        }}
        title={`Delete ${deleting?.name ?? 'server'}?`}
        description="Only possible when no character is on it. Worlds that left the official list are better kept as inactive."
        loading={remove.isPending}
        error={
          getErrorStatus(remove.error) === 409
            ? 'Characters are still on this server, so it cannot be deleted.'
            : remove.error
        }
        onConfirm={() =>
          deleting &&
          remove.mutate(deleting.id, {
            onSuccess: () => {
              toast.success(`${deleting.name} deleted`);
              setDeleting(null);
            },
          })
        }
      />
    </>
  );
}
