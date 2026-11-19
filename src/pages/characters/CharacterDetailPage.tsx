import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Globe, Pencil, Trash2 } from 'lucide-react';
import { useDeleteCharacter } from '@/hooks/useCharacters';
import { CharacterScope } from '@/components/CharacterScope';
import { useToast } from '@/components/ui/Toast';
import { Button, ButtonLink } from '@/components/ui/Button';
import { ConfirmDialog } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { vocationLabel } from '@/lib/labels';
import type { CharacterResponse } from '@/types';
import { InventoryPanel } from '../inventory/InventoryPanel';
import { SaleDecisionPanel } from '../inventory/SaleDecisionPanel';
import { HuntListPanel } from '../hunts/HuntListPanel';

type Tab = 'inventory' | 'sell' | 'hunts';

const TABS: { label: string; value: Tab }[] = [
  { label: 'Inventory', value: 'inventory' },
  { label: 'Sell', value: 'sell' },
  { label: 'Hunt history', value: 'hunts' },
];

export function CharacterDetailPage() {
  return <CharacterScope param="id">{(character) => <CharacterDetail character={character} />}</CharacterScope>;
}

function CharacterDetail({ character }: { character: CharacterResponse }) {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const remove = useDeleteCharacter();

  const raw = params.get('tab');
  const tab: Tab = raw === 'sell' || raw === 'hunts' ? raw : 'inventory';

  return (
    <>
      <PageHeader
        back={{ to: '/characters', label: 'Characters' }}
        title={character.name}
        description={
          <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{vocationLabel(character.vocation)}</span>
            <span className="inline-flex items-center gap-1.5">
              <Globe size={14} aria-hidden /> {character.serverName}
            </span>
          </span>
        }
        actions={
          <>
            <ButtonLink to={`/characters/${character.id}/edit`} variant="secondary" size="sm">
              <Pencil size={14} /> Edit
            </ButtonLink>
            <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
              <Trash2 size={14} /> Delete
            </Button>
          </>
        }
      />

      <SegmentedToggle
        label="Section"
        className="mb-6"
        options={TABS}
        value={tab}
        onChange={(next) => setParams(next === 'inventory' ? {} : { tab: next }, { replace: true })}
      />

      {tab === 'inventory' && <InventoryPanel character={character} />}
      {tab === 'sell' && <SaleDecisionPanel character={character} />}
      {tab === 'hunts' && <HuntListPanel character={character} />}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => {
          setConfirmDelete(false);
          remove.reset();
        }}
        title={`Delete ${character.name}?`}
        description="Its inventory and hunt history are deleted too. This cannot be undone."
        confirmLabel="Delete character"
        loading={remove.isPending}
        error={remove.error}
        onConfirm={() =>
          remove.mutate(character.id, {
            onSuccess: () => {
              toast.success(`${character.name} deleted`);
              navigate('/characters', { replace: true });
            },
          })
        }
      />
    </>
  );
}
