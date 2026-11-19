import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSaveCharacter } from '@/hooks/useCharacters';
import { useServers } from '@/hooks/useCatalog';
import { useActiveCharacter } from '@/contexts/ActiveCharacterContext';
import { useToast } from '@/components/ui/Toast';
import { CharacterScope } from '@/components/CharacterScope';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { ErrorState, InlineError } from '@/components/ui/States';
import { VOCATIONS, pvpLabel } from '@/lib/labels';
import type { CharacterResponse, Vocation } from '@/types';

// Mirrors CharacterRequest validation in tlim-java.
const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be at most 100 characters')
    .regex(/^[a-zA-Z ]+$/, 'Only letters and spaces are allowed'),
  serverId: z.string().min(1, 'Choose a server'),
  vocation: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function CharacterNewPage() {
  return <CharacterForm />;
}

export function CharacterEditPage() {
  return <CharacterScope param="id">{(character) => <CharacterForm character={character} />}</CharacterScope>;
}

function CharacterForm({ character }: { character?: CharacterResponse }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { setActiveId } = useActiveCharacter();
  const save = useSaveCharacter();
  const servers = useServers();

  // A character may stay on a world that left the official list, but cannot move to one.
  const serverOptions = useMemo(() => {
    const list = servers.data ?? [];
    if (character && !list.some((s) => s.id === character.serverId)) {
      return [{ id: character.serverId, name: `${character.serverName} (inactive)`, pvpType: null }, ...list];
    }
    return list;
  }, [servers.data, character]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: character?.name ?? '',
      serverId: character ? String(character.serverId) : '',
      vocation: character?.vocation ?? '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    const saved = await save.mutateAsync({
      id: character?.id,
      body: {
        name: values.name,
        serverId: Number(values.serverId),
        vocation: values.vocation ? (values.vocation as Vocation) : null,
      },
    });
    toast.success(character ? 'Character updated' : `${saved.name} created`);
    setActiveId(saved.id);
    navigate(`/characters/${saved.id}`, { replace: true });
  });

  const cancelTo = character ? `/characters/${character.id}` : '/characters';

  return (
    <>
      <PageHeader
        title={character ? `Edit ${character.name}` : 'New character'}
        description="Market prices and sale decisions use the character's server."
        back={{ to: cancelTo, label: character ? character.name : 'Characters' }}
      />
      <Card className="max-w-xl">
        {servers.error ? (
          <ErrorState error={servers.error} title="Could not load the server list" onRetry={() => servers.refetch()} />
        ) : (
          <form onSubmit={(e) => onSubmit(e).catch(() => undefined)} className="flex flex-col gap-5" noValidate>
            <Input
              label="Name"
              placeholder="e.g. Knight Sir Loot"
              autoFocus={!character}
              error={errors.name?.message}
              {...register('name')}
            />
            <Select
              label="Server"
              error={errors.serverId?.message}
              disabled={servers.isLoading}
              hint={servers.data && !servers.data.length ? 'No worlds yet: ask an admin to import the world list.' : undefined}
              {...register('serverId')}
            >
              <option value="">{servers.isLoading ? 'Loading servers…' : 'Choose a server'}</option>
              {serverOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                  {s.pvpType ? ` · ${pvpLabel(s.pvpType)}` : ''}
                </option>
              ))}
            </Select>
            <Select label="Vocation (optional)" {...register('vocation')}>
              <option value="">No vocation</option>
              {VOCATIONS.map((v) => (
                <option key={v.value} value={v.value}>
                  {v.label}
                </option>
              ))}
            </Select>
            <InlineError error={save.error} />
            <div className="flex gap-2">
              <Button type="submit" loading={save.isPending}>
                {character ? 'Save changes' : 'Create character'}
              </Button>
              <ButtonLink to={cancelTo} variant="secondary">
                Cancel
              </ButtonLink>
            </div>
          </form>
        )}
      </Card>
    </>
  );
}
