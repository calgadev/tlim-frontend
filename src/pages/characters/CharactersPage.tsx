import { Link } from 'react-router-dom';
import { Plus, Users, Globe } from 'lucide-react';
import { useCharacters } from '@/hooks/useCharacters';
import { useActiveCharacter } from '@/contexts/ActiveCharacterContext';
import { ButtonLink } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { vocationLabel } from '@/lib/labels';
import { formatDate } from '@/lib/format';

export function CharactersPage() {
  const { data, error, isLoading, refetch } = useCharacters();
  const { character: active } = useActiveCharacter();

  return (
    <>
      <PageHeader
        title="Your characters"
        description="Each character has its own inventory, hunt history and sale decisions, priced on its server."
        actions={
          <ButtonLink to="/characters/new">
            <Plus size={16} /> New character
          </ButtonLink>
        }
      />

      {isLoading ? (
        <LoadingState variant="card" rows={3} />
      ) : error ? (
        <Card>
          <ErrorState error={error} onRetry={() => refetch()} />
        </Card>
      ) : !data?.length ? (
        <Card>
          <EmptyState
            icon={<Users size={36} />}
            title="No characters yet"
            description="Create a character to start tracking its loot, inventory and hunts."
            action={
              <ButtonLink to="/characters/new">
                <Plus size={16} /> Create character
              </ButtonLink>
            }
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data.map((c) => (
            <Link
              key={c.id}
              to={`/characters/${c.id}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.03] p-6 shadow-card transition-colors hover:border-gold/30"
            >
              <div className="mb-4 flex items-start justify-between gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gold-gradient text-lg font-bold text-gold-ink">
                  {c.name[0]?.toUpperCase()}
                </div>
                {active?.id === c.id && <Badge variant="gold">Active</Badge>}
              </div>
              <h3 className="truncate text-lg font-semibold text-fg group-hover:text-gold-light">{c.name}</h3>
              <p className="text-sm text-fg-secondary">{vocationLabel(c.vocation)}</p>
              <div className="mt-4 flex items-center justify-between text-xs text-fg-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Globe size={14} aria-hidden /> {c.serverName}
                </span>
                <span>Since {formatDate(c.createdAt)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
