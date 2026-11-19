import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSaveServer } from '@/hooks/useCatalog';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Field';
import { Modal } from '@/components/ui/Modal';
import { InlineError } from '@/components/ui/States';
import { PVP_TYPES } from '@/lib/labels';
import type { PvpType, ServerResponse } from '@/types';

// Mirrors ServerRequest validation in tlim-java.
const schema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'At most 100 characters'),
  pvpType: z.string().min(1, 'Choose a PvP type'),
  location: z.string().trim().max(50, 'At most 50 characters'),
});

type FormValues = z.infer<typeof schema>;

/** ADMIN only. Normally worlds come from the official list import; this is for corrections. */
export function ServerFormModal({ server, onClose }: { server: ServerResponse | null; onClose: () => void }) {
  const save = useSaveServer();
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: server?.name ?? '',
      pvpType: server?.pvpType ?? '',
      location: server?.location ?? '',
    },
  });

  const onSubmit = handleSubmit((v) =>
    save.mutate(
      { id: server?.id, body: { name: v.name, pvpType: v.pvpType as PvpType, location: v.location || null } },
      {
        onSuccess: (saved) => {
          toast.success(server ? `${saved.name} updated` : `${saved.name} added`);
          onClose();
        },
      }
    )
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={server ? `Edit ${server.name}` : 'Add server'}
      description="The world list import matches worlds by name, so keep the official spelling."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="server-form" loading={save.isPending}>
            Save
          </Button>
        </>
      }
    >
      <form id="server-form" onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <Input label="Name" error={errors.name?.message} {...register('name')} />
        <Select label="PvP type" error={errors.pvpType?.message} {...register('pvpType')}>
          <option value="">Choose a PvP type</option>
          {PVP_TYPES.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
        <Input label="Location (optional)" placeholder="e.g. Europe" error={errors.location?.message} {...register('location')} />
        <InlineError error={save.error} />
      </form>
    </Modal>
  );
}
