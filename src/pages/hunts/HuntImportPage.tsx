import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useImportHunt } from '@/hooks/useCharacters';
import { CharacterScope } from '@/components/CharacterScope';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Checkbox, Input, Textarea } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { SegmentedToggle } from '@/components/ui/SegmentedToggle';
import { InlineError } from '@/components/ui/States';
import { formatGold, formatNumber, toOptionalInt } from '@/lib/format';
import { VOCATIONS } from '@/lib/labels';
import { cn } from '@/lib/utils';
import type { CharacterResponse, HuntImportFormat, HuntSessionResponse, Vocation } from '@/types';

const level = z
  .string()
  .trim()
  .regex(/^\d{0,4}$/, 'Level must be a whole number');

const schema = z.object({
  rawData: z.string().trim().min(1, 'Paste the Hunt Analyser export'),
  name: z.string().trim().max(100, 'At most 100 characters'),
  location: z.string().trim().max(100, 'At most 100 characters'),
  notes: z.string().trim().max(1000, 'At most 1000 characters'),
  isParty: z.boolean(),
  charLevel: level,
  allyEkLevel: level,
  allyMsLevel: level,
  allyEdLevel: level,
  allyRpLevel: level,
  allyEmLevel: level,
});

type FormValues = z.infer<typeof schema>;
type AllyField = 'allyEkLevel' | 'allyMsLevel' | 'allyEdLevel' | 'allyRpLevel' | 'allyEmLevel';

const ALLY_FIELDS: Record<Vocation, AllyField> = {
  EK: 'allyEkLevel',
  MS: 'allyMsLevel',
  ED: 'allyEdLevel',
  RP: 'allyRpLevel',
  EM: 'allyEmLevel',
};

const PLACEHOLDER = {
  text: `Session data: From 2026-01-23, 18:13:14 to 2026-01-23, 18:24:01
Session: 00:10h
Raw XP Gain: 17,701
XP Gain: 26,551
Loot: 1,479
Supplies: 4,543
Balance: -3,064
Damage: 31,183
Healing: 6,401
Killed Monsters:
  20x bog raider
Looted Items:
  725x a gold coin`,
  json: `{
  "Session start": "2026-01-23, 18:13:14",
  "Session end": "2026-01-23, 18:24:04",
  "Session length": "00:10h",
  "Raw XP Gain": "17,701",
  "XP Gain": "26,551",
  "Loot": "1,479",
  "Supplies": "4,543",
  "Damage": "31,183",
  "Healing": "6,401",
  "Killed Monsters": [{ "Name": "bog raider", "Count": 20 }],
  "Looted Items": [{ "Name": "a gold coin", "Count": 725 }]
}`,
};

export function HuntImportPage() {
  return <CharacterScope>{(character) => <HuntImport character={character} />}</CharacterScope>;
}

function HuntImport({ character }: { character: CharacterResponse }) {
  const [result, setResult] = useState<HuntSessionResponse | null>(null);

  return (
    <>
      <PageHeader
        title="Import a hunt"
        description={`For ${character.name}. In the Tibia client, open the Hunt Analyser and copy the session (text) or export it (JSON).`}
        back={{ to: `/hunts/${character.id}`, label: `${character.name}'s hunts` }}
      />
      {result ? (
        <ImportResult session={result} character={character} onAnother={() => setResult(null)} />
      ) : (
        <ImportForm character={character} onImported={setResult} />
      )}
    </>
  );
}

function ImportForm({ character, onImported }: { character: CharacterResponse; onImported: (s: HuntSessionResponse) => void }) {
  const [format, setFormat] = useState<HuntImportFormat>('text');
  const importHunt = useImportHunt();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      rawData: '',
      name: '',
      location: '',
      notes: '',
      isParty: false,
      charLevel: '',
      allyEkLevel: '',
      allyMsLevel: '',
      allyEdLevel: '',
      allyRpLevel: '',
      allyEmLevel: '',
    },
  });
  const isParty = useWatch({ control, name: 'isParty' });
  const rawField = register('rawData');

  const onSubmit = handleSubmit((v) => {
    importHunt.mutate(
      {
        format,
        body: {
          characterId: character.id,
          rawData: v.rawData,
          name: v.name || null,
          location: v.location || null,
          notes: v.notes || null,
          isParty: v.isParty,
          charLevel: toOptionalInt(v.charLevel),
          allyEkLevel: v.isParty ? toOptionalInt(v.allyEkLevel) : null,
          allyMsLevel: v.isParty ? toOptionalInt(v.allyMsLevel) : null,
          allyEdLevel: v.isParty ? toOptionalInt(v.allyEdLevel) : null,
          allyRpLevel: v.isParty ? toOptionalInt(v.allyRpLevel) : null,
          allyEmLevel: v.isParty ? toOptionalInt(v.allyEmLevel) : null,
        },
      },
      { onSuccess: onImported }
    );
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader
          title="Hunt Analyser data"
          description="Paste it exactly as copied. The format is detected when you paste."
          actions={
            <SegmentedToggle
              label="Format"
              options={[
                { label: 'Text', value: 'text' },
                { label: 'JSON', value: 'json' },
              ]}
              value={format}
              onChange={setFormat}
            />
          }
        />
        <Textarea
          aria-label="Hunt Analyser data"
          placeholder={PLACEHOLDER[format]}
          spellCheck={false}
          className="min-h-80 font-mono text-xs"
          error={errors.rawData?.message}
          {...rawField}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData('text').trimStart();
            if (pasted) setFormat(pasted.startsWith('{') ? 'json' : 'text');
          }}
        />
      </Card>

      <Card>
        <CardHeader title="Details" description="All optional." />
        <div className="flex flex-col gap-4">
          <Input label="Name" placeholder="Defaults to “Hunt dd/MM HH:mm”" error={errors.name?.message} {...register('name')} />
          <Input label="Location" placeholder="e.g. Rotworm Cave" error={errors.location?.message} {...register('location')} />
          <Input
            label={`${character.name}'s level`}
            inputMode="numeric"
            error={errors.charLevel?.message}
            {...register('charLevel')}
          />
          <Checkbox label="Party hunt" {...register('isParty')} />
          {isParty && (
            <div className="grid grid-cols-2 gap-3 rounded-2xl border border-white/[0.06] p-3">
              <p className="col-span-2 text-xs text-fg-muted">Highest ally level per vocation</p>
              {VOCATIONS.map((v) => (
                <Input
                  key={v.value}
                  label={v.value}
                  title={v.label}
                  inputMode="numeric"
                  error={errors[ALLY_FIELDS[v.value]]?.message}
                  {...register(ALLY_FIELDS[v.value])}
                />
              ))}
            </div>
          )}
          <Textarea label="Notes" className="min-h-20" error={errors.notes?.message} {...register('notes')} />
          <InlineError error={importHunt.error} />
          <Button type="submit" loading={importHunt.isPending}>
            Import hunt
          </Button>
        </div>
      </Card>
    </form>
  );
}

function ImportResult({
  session,
  character,
  onAnother,
}: {
  session: HuntSessionResponse;
  character: CharacterResponse;
  onAnother: () => void;
}) {
  const skipped = session.skippedItems.length + session.skippedMonsters.length;
  return (
    <Card className="max-w-3xl">
      <div className="mb-5 flex items-start gap-3">
        <CheckCircle2 size={24} className="mt-0.5 shrink-0 text-success" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-fg">“{session.name}” imported</h2>
          <p className="text-sm text-fg-secondary">
            {formatNumber(session.items.length)} item types were added to {character.name}&apos;s inventory. Balance{' '}
            <span className={cn('font-medium', session.balance >= 0 ? 'text-success' : 'text-danger')}>
              {formatGold(session.balance)}
            </span>
            .
          </p>
        </div>
      </div>

      {skipped > 0 && (
        <div className="mb-5 rounded-2xl border border-warning/30 bg-warning/10 p-4">
          <p className="mb-2 flex items-center gap-2 text-sm font-medium text-warning">
            <AlertTriangle size={16} aria-hidden /> {skipped} names were not found in the catalog and were skipped
          </p>
          <p className="mb-3 text-xs text-fg-secondary">
            The session was saved without them, and skipped items were not added to the inventory. An admin can run the
            TibiaWiki scraper to fill the catalog. This list is shown only now.
          </p>
          <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            {session.skippedItems.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-fg-muted">Items</p>
                <ul className="list-inside list-disc text-fg-secondary">
                  {session.skippedItems.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
            {session.skippedMonsters.length > 0 && (
              <div>
                <p className="mb-1 text-xs uppercase tracking-wide text-fg-muted">Creatures</p>
                <ul className="list-inside list-disc text-fg-secondary">
                  {session.skippedMonsters.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <ButtonLink to={`/hunts/session/${session.id}`}>View session</ButtonLink>
        <ButtonLink to={`/inventory/${character.id}`} variant="secondary">
          Open inventory
        </ButtonLink>
        <Button variant="ghost" onClick={onAnother}>
          Import another
        </Button>
      </div>
    </Card>
  );
}
