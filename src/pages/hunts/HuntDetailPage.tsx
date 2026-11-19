import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { useDeleteHunt, useHuntSession } from '@/hooks/useCharacters';
import { getErrorStatus } from '@/api/errors';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatHuntDateTime, formatGold, formatGoldShort, formatNumber, parseId } from '@/lib/format';
import type { HuntSessionResponse } from '@/types';

export function HuntDetailPage() {
  const id = parseId(useParams().id);
  if (id === null) return <SessionNotFound />;
  return <HuntDetailLoader id={id} />;
}

function HuntDetailLoader({ id }: { id: number }) {
  const { data, error, isLoading, refetch } = useHuntSession(id);
  if (isLoading) return <LoadingState variant="card" rows={4} />;
  if (error) {
    const status = getErrorStatus(error);
    return status === 404 || status === 403 ? <SessionNotFound /> : <ErrorState error={error} onRetry={() => refetch()} />;
  }
  return data ? <HuntDetail session={data} /> : null;
}

function SessionNotFound() {
  return (
    <Card>
      <EmptyState
        title="Hunt session not found"
        description="It may have been deleted, or it belongs to another account."
        action={<ButtonLink to="/hunts">Back to hunts</ButtonLink>}
      />
    </Card>
  );
}

const ALLIES: { key: keyof HuntSessionResponse; label: string }[] = [
  { key: 'allyEkLevel', label: 'EK' },
  { key: 'allyMsLevel', label: 'MS' },
  { key: 'allyEdLevel', label: 'ED' },
  { key: 'allyRpLevel', label: 'RP' },
  { key: 'allyEmLevel', label: 'EM' },
];

function HuntDetail({ session }: { session: HuntSessionResponse }) {
  const navigate = useNavigate();
  const toast = useToast();
  const remove = useDeleteHunt();
  const [confirm, setConfirm] = useState(false);
  const allies = ALLIES.filter((a) => session[a.key] !== null);
  const items = [...session.items].sort((a, b) => b.quantity - a.quantity);
  const monsters = [...session.monsters].sort((a, b) => b.killCount - a.killCount);

  return (
    <>
      <PageHeader
        back={{ to: `/hunts/${session.characterId}`, label: 'Hunt history' }}
        title={session.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            {formatHuntDateTime(session.startedAt)} → {formatHuntDateTime(session.endedAt)} · {session.duration}
            {session.location && <Badge>{session.location}</Badge>}
            {session.isParty && <Badge variant="info">Party</Badge>}
          </span>
        }
        actions={
          <Button variant="danger" size="sm" onClick={() => setConfirm(true)}>
            <Trash2 size={14} /> Delete
          </Button>
        }
      />

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Balance"
          tone={session.balance >= 0 ? 'success' : 'danger'}
          metric={formatGoldShort(session.balance)}
          trend={`${formatGold(session.lootTotal)} loot − ${formatGold(session.supplies)} supplies`}
        />
        <StatCard label="XP gained" metric={formatGoldShort(session.xpWithBonus)} trend={`${formatNumber(session.rawXp)} raw`} />
        <StatCard label="Damage" metric={formatGoldShort(session.damage)} />
        <StatCard label="Healing" metric={formatGoldShort(session.healing)} />
      </div>

      {(session.charLevel !== null || allies.length > 0 || session.notes) && (
        <Card className="mb-6">
          <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
            {session.charLevel !== null && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fg-muted">Level</dt>
                <dd className="text-fg">{session.charLevel}</dd>
              </div>
            )}
            {allies.map((a) => (
              <div key={a.key}>
                <dt className="text-xs uppercase tracking-wide text-fg-muted">Ally {a.label}</dt>
                <dd className="text-fg">{String(session[a.key])}</dd>
              </div>
            ))}
            {session.notes && (
              <div className="basis-full">
                <dt className="text-xs uppercase tracking-wide text-fg-muted">Notes</dt>
                <dd className="whitespace-pre-wrap text-fg-secondary">{session.notes}</dd>
              </div>
            )}
          </dl>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card padded={false}>
          <CardHeader title="Loot" description={`${items.length} item types`} className="mb-0 p-6 pb-4" />
          {items.length ? (
            <Table>
              <THead>
                <tr>
                  <Th>Item</Th>
                  <Th align="right">Quantity</Th>
                </tr>
              </THead>
              <TBody>
                {items.map((i) => (
                  <Tr key={i.id}>
                    <Td>
                      <Link to={`/wiki/items/${i.itemId}`} className="hover:text-gold-light">
                        {i.itemName}
                      </Link>
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {formatNumber(i.quantity)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="No recognised loot" />
          )}
        </Card>
        <Card padded={false}>
          <CardHeader title="Kills" description={`${formatNumber(monsters.reduce((n, m) => n + m.killCount, 0))} creatures`} className="mb-0 p-6 pb-4" />
          {monsters.length ? (
            <Table>
              <THead>
                <tr>
                  <Th>Creature</Th>
                  <Th align="right">Killed</Th>
                </tr>
              </THead>
              <TBody>
                {monsters.map((m) => (
                  <Tr key={m.id}>
                    <Td>
                      <Link to={`/wiki/creatures/${m.creatureId}`} className="hover:text-gold-light">
                        {m.creatureName}
                      </Link>
                    </Td>
                    <Td align="right" className="tabular-nums">
                      {formatNumber(m.killCount)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="No recognised creatures" />
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={confirm}
        onClose={() => {
          setConfirm(false);
          remove.reset();
        }}
        title="Delete this hunt?"
        description="Its loot is subtracted from the character's inventory again (never below 0)."
        confirmLabel="Delete hunt"
        loading={remove.isPending}
        error={remove.error}
        onConfirm={() =>
          remove.mutate(
            { id: session.id, characterId: session.characterId },
            {
              onSuccess: () => {
                toast.success('Hunt deleted and loot removed from the inventory');
                navigate(`/hunts/${session.characterId}`, { replace: true });
              },
            }
          )
        }
      />
    </>
  );
}
