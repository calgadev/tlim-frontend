import { useParams } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { useItem } from '@/hooks/useCatalog';
import { getErrorStatus } from '@/api/errors';
import { ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { PageHeader } from '@/components/ui/PageHeader';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/States';
import { Table, TBody, Td, Th, THead, Tr } from '@/components/ui/Table';
import { formatDateTime, formatGold, parseId } from '@/lib/format';
import { ItemFlags } from './ItemsPage';

export function ItemDetailPage() {
  const id = parseId(useParams().id);
  if (id === null) return <NotFound />;
  return <ItemDetail id={id} />;
}

function NotFound() {
  return (
    <Card>
      <EmptyState title="Item not found" action={<ButtonLink to="/wiki/items">Back to items</ButtonLink>} />
    </Card>
  );
}

function ItemDetail({ id }: { id: number }) {
  const { data: item, error, isLoading, refetch } = useItem(id);
  if (isLoading) return <LoadingState rows={6} />;
  if (error) return getErrorStatus(error) === 404 ? <NotFound /> : <ErrorState error={error} onRetry={() => refetch()} />;
  if (!item) return null;

  const buyers = [...item.npcBuyers].sort((a, b) => b.price - a.price);

  return (
    <>
      <PageHeader
        back={{ to: '/wiki/items', label: 'Items' }}
        title={
          <span className="flex items-center gap-3">
            {item.imageUrl && <img src={item.imageUrl} alt="" className="h-8 w-8 object-contain" referrerPolicy="no-referrer" />}
            {item.name}
          </span>
        }
        description={item.category ?? 'No category'}
        actions={
          item.wikiUrl && (
            <a href={item.wikiUrl} target="_blank" rel="noopener noreferrer" className="link-gold inline-flex items-center gap-1 text-sm">
              TibiaWiki <ExternalLink size={14} aria-hidden />
            </a>
          )
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Details" />
          <dl className="flex flex-col gap-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Weight</dt>
              <dd className="text-fg">{item.weight === null ? '—' : `${item.weight} oz`}</dd>
            </div>
            {item.actualName && item.actualName !== item.name.toLowerCase() && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fg-muted">In-game name</dt>
                <dd className="text-fg">{item.actualName}</dd>
              </div>
            )}
            <div>
              <dt className="mb-1 text-xs uppercase tracking-wide text-fg-muted">Flags</dt>
              <dd>
                <ItemFlags item={item} />
                {!item.isTaskItem && !item.isImbuementMaterial && !item.isQuestItem && !item.isDeliveryItem && (
                  <span className="text-fg-muted">None</span>
                )}
              </dd>
            </div>
            {item.description && (
              <div>
                <dt className="text-xs uppercase tracking-wide text-fg-muted">Description</dt>
                <dd className="text-fg-secondary">{item.description}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs uppercase tracking-wide text-fg-muted">Updated</dt>
              <dd className="text-fg-secondary">{formatDateTime(item.updatedAt)}</dd>
            </div>
          </dl>
        </Card>

        <Card padded={false} className="lg:col-span-2">
          <CardHeader
            title="NPC buyers"
            description={buyers.length ? `Best offer: ${formatGold(buyers[0].price)}` : undefined}
            className="mb-0 p-6 pb-4"
          />
          {buyers.length ? (
            <Table>
              <THead>
                <tr>
                  <Th>NPC</Th>
                  <Th>Location</Th>
                  <Th align="right">Pays</Th>
                </tr>
              </THead>
              <TBody>
                {buyers.map((b, i) => (
                  <Tr key={b.id} tint={i === 0 ? 'success' : 'none'}>
                    <Td className="font-medium">{b.npcName}</Td>
                    <Td className="text-fg-secondary">{b.location ?? '—'}</Td>
                    <Td align="right" className="tabular-nums">
                      {formatGold(b.price)}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          ) : (
            <EmptyState title="No NPC buys this item" description="It can only be sold on the market." />
          )}
        </Card>
      </div>
    </>
  );
}
