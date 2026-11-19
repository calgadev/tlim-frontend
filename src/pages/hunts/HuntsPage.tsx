import { CharacterScope } from '@/components/CharacterScope';
import { PageHeader } from '@/components/ui/PageHeader';
import { HuntListPanel } from './HuntListPanel';

export function HuntsPage() {
  return (
    <CharacterScope>
      {(character) => (
        <>
          <PageHeader
            title={`${character.name}'s hunts`}
            description="Newest first. Compare spots by balance and experience."
            back={{ to: `/characters/${character.id}`, label: character.name }}
          />
          <HuntListPanel character={character} />
        </>
      )}
    </CharacterScope>
  );
}
