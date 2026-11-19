import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useUpsertInventory } from '@/hooks/useCharacters';
import { useToast } from '@/components/ui/Toast';
import { ItemPicker } from '@/components/ItemPicker';
import type { PickedItem } from '@/components/ItemPicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { InlineError } from '@/components/ui/States';
import type { InventoryResponse } from '@/types';

const quantity = z
  .string()
  .trim()
  .min(1, 'Required')
  .regex(/^\d+$/, 'Whole number, 0 or more')
  .refine((v) => Number(v) <= 2_147_483_647, 'Too large');

const schema = z.object({
  item: z.custom<PickedItem | null>().refine((v) => v !== null, 'Choose an item'),
  currentQuantity: quantity,
  targetQuantity: quantity,
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  characterId: number;
  /** null to add a new item */
  entry: InventoryResponse | null;
  existingIds: Set<number>;
  onClose: () => void;
}

export function InventoryEntryModal({ characterId, entry, existingIds, onClose }: Props) {
  const upsert = useUpsertInventory(characterId);
  const toast = useToast();
  const [picked, setPicked] = useState<PickedItem | null>(entry ? { id: entry.itemId, name: entry.itemName } : null);

  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      item: picked,
      currentQuantity: entry ? String(entry.currentQuantity) : '0',
      targetQuantity: entry ? String(entry.targetQuantity) : '0',
    },
  });

  const onSubmit = handleSubmit((values) => {
    const { item } = values;
    upsert.mutate(
      { itemId: item.id, currentQuantity: Number(values.currentQuantity), targetQuantity: Number(values.targetQuantity) },
      {
        onSuccess: () => {
          toast.success(entry ? `${item.name} updated` : `${item.name} saved`);
          onClose();
        },
      }
    );
  });

  // Saving an item that is already in the inventory replaces its quantities (the API upserts).
  const replacesExisting = !entry && picked !== null && existingIds.has(picked.id);

  return (
    <Modal
      open
      onClose={onClose}
      title={entry ? `Edit ${entry.itemName}` : 'Add item'}
      description="Target is how many you want to keep. Anything above it counts as surplus to sell; 0 means no goal."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="inventory-entry-form" loading={upsert.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="inventory-entry-form" onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        {entry ? (
          <p className="text-sm text-fg-secondary">
            Item: <span className="font-medium text-fg">{entry.itemName}</span>
          </p>
        ) : (
          <Controller
            control={control}
            name="item"
            render={({ field }) => (
              <ItemPicker
                autoFocus
                value={field.value}
                onChange={(item) => {
                  field.onChange(item);
                  setPicked(item);
                }}
                excludeIds={existingIds}
                error={errors.item?.message}
              />
            )}
          />
        )}
        {replacesExisting && (
          <p className="rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">
            This item is already in the inventory. Saving replaces its quantities.
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Current quantity"
            inputMode="numeric"
            error={errors.currentQuantity?.message}
            {...register('currentQuantity')}
          />
          <Input
            label="Target quantity"
            inputMode="numeric"
            error={errors.targetQuantity?.message}
            {...register('targetQuantity')}
          />
        </div>
        <InlineError error={upsert.error} />
      </form>
    </Modal>
  );
}
