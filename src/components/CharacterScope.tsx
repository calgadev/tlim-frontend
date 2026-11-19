import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { UserX } from 'lucide-react';
import { useCharacter } from '@/hooks/useCharacters';
import { useActiveCharacter } from '@/contexts/ActiveCharacterContext';
import { getErrorStatus } from '@/api/errors';
import { parseId } from '@/lib/format';
import { ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import type { CharacterResponse } from '@/types';

/**
 * Loads the character named by the route param (`:characterId` or `:id`), makes it the active
 * character, and renders the children with it. Handles malformed ids, 404 and 403 in one place.
 */
export function CharacterScope({
  param = 'characterId',
  children,
}: {
  param?: string;
  children: (character: CharacterResponse) => ReactNode;
}) {
  const params = useParams();
  const id = parseId(params[param]);
  if (id === null) return <CharacterNotFound />;
  return <CharacterLoader id={id}>{children}</CharacterLoader>;
}

function CharacterLoader({ id, children }: { id: number; children: (character: CharacterResponse) => ReactNode }) {
  const { data, error, isLoading, refetch } = useCharacter(id);
  const { setActiveId } = useActiveCharacter();

  useEffect(() => {
    if (data) setActiveId(data.id);
  }, [data, setActiveId]);

  if (isLoading) return <LoadingState rows={6} />;
  if (error) {
    const status = getErrorStatus(error);
    // Another user's character is reported as 404 (or 403 on nested routes): same message either way.
    if (status === 404 || status === 403) return <CharacterNotFound />;
    return <ErrorState error={error} onRetry={() => refetch()} />;
  }
  if (!data) return null;
  return <>{children(data)}</>;
}

function CharacterNotFound() {
  return (
    <Card>
      <EmptyState
        icon={<UserX size={36} />}
        title="Character not found"
        description="It may have been deleted, or it belongs to another account."
        action={<ButtonLink to="/characters">Back to characters</ButtonLink>}
      />
    </Card>
  );
}

/** /inventory and /hunts without an id: open the active character, or ask to create one. */
export function ActiveCharacterRedirect({ to }: { to: (characterId: number) => string }) {
  const { character, isLoading } = useActiveCharacter();
  if (isLoading) return <LoadingState rows={4} />;
  if (!character) return <Navigate to="/characters" replace />;
  return <Navigate to={to(character.id)} replace />;
}
