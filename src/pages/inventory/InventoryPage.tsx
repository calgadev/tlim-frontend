import { Coins } from 'lucide-react';
import { CharacterScope } from '@/components/CharacterScope';
import { ButtonLink } from '@/components/ui/Button';
import { PageHeader } from '@/components/ui/PageHeader';
import { InventoryPanel } from './InventoryPanel';
import { SaleDecisionPanel } from './SaleDecisionPanel';

export function InventoryPage() {
  return (
    <CharacterScope>
      {(character) => (
        <>
          <PageHeader
            title={`${character.name}'s inventory`}
            description="Rows in amber are below target; green ones have surplus to sell."
            back={{ to: `/characters/${character.id}`, label: character.name }}
            actions={
              <ButtonLink to={`/inventory/${character.id}/sell`} variant="secondary" size="sm">
                <Coins size={14} /> What should I sell?
              </ButtonLink>
            }
          />
          <InventoryPanel character={character} />
        </>
      )}
    </CharacterScope>
  );
}

export function SellPage() {
  return (
    <CharacterScope>
      {(character) => (
        <>
          <PageHeader
            title="Sale decisions"
            description={`For each item above its target, sell to an NPC or on the ${character.serverName} market, whichever pays more.`}
            back={{ to: `/inventory/${character.id}`, label: `${character.name}'s inventory` }}
          />
          <SaleDecisionPanel character={character} />
        </>
      )}
    </CharacterScope>
  );
}
