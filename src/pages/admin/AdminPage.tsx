import { useEffect, useRef, useState } from 'react';
import { Bot, Globe, Play, RefreshCw } from 'lucide-react';
import { useInvalidateCatalog, useScrapeServers, useScrapeStatus, useStartScrape } from '@/hooks/useAdmin';
import { getApiErrorMessage, getErrorStatus } from '@/api/errors';
import { useToast } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';
import { Button, ButtonLink } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Select } from '@/components/ui/Field';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { ErrorState, InlineError, LoadingState } from '@/components/ui/States';
import { SCRAPER_STATUS } from '@/lib/labels';
import { formatDateTime, formatElapsed, formatNumber } from '@/lib/format';
import type { ScrapeScope, ServerScrapeResult } from '@/types';

export function AdminPage() {
  const status = useScrapeStatus();
  const s = status.data;
  return (
    <>
      <PageHeader title="Admin panel" description="Keep the shared catalog up to date. These actions affect every user." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader
            title={
              <span className="flex items-center gap-2">
                <Bot size={18} className="text-gold" aria-hidden /> TibiaWiki scraper
              </span>
            }
            description="Imports items (with NPC buyers) and creatures (with loot) from TibiaWiki."
            actions={s && <Badge variant={SCRAPER_STATUS[s.status].variant}>{SCRAPER_STATUS[s.status].label}</Badge>}
          />
          {status.error ? (
            <InlineError error={status.error} />
          ) : (
            <p className="mb-4 text-sm text-fg-secondary">
              {s?.status === 'RUNNING'
                ? `Running for ${formatElapsed(s.startedAt!)}…`
                : s?.completedAt
                  ? `Last run finished ${formatDateTime(s.completedAt)}.`
                  : 'No run since the backend started.'}
            </p>
          )}
          <ButtonLink to="/admin/scraper" variant="secondary" size="sm">
            Open scraper
          </ButtonLink>
        </Card>
        <WorldListCard />
      </div>
    </>
  );
}

function WorldListCard() {
  const scrape = useScrapeServers();
  const toast = useToast();
  const [result, setResult] = useState<ServerScrapeResult | null>(null);

  return (
    <Card>
      <CardHeader
        title={
          <span className="flex items-center gap-2">
            <Globe size={18} className="text-gold" aria-hidden /> Official world list
          </span>
        }
        description="Synchronises servers with TibiaData. New worlds are added; worlds that left the list become inactive."
      />
      {result && <ServerResultLine result={result} />}
      <InlineError
        className="mb-3"
        error={getErrorStatus(scrape.error) === 502 ? 'TibiaData is unavailable right now. Try again later.' : scrape.error}
      />
      <Button
        variant="secondary"
        size="sm"
        loading={scrape.isPending}
        onClick={() =>
          scrape.mutate(undefined, {
            onSuccess: (r) => {
              setResult(r);
              toast.success('World list synchronised');
            },
          })
        }
      >
        <RefreshCw size={14} /> Import world list
      </Button>
    </Card>
  );
}

function ServerResultLine({ result }: { result: ServerScrapeResult }) {
  return (
    <p className="mb-3 text-sm text-fg-secondary">
      {formatNumber(result.created)} created · {formatNumber(result.updated)} updated ·{' '}
      {formatNumber(result.deactivated)} deactivated · {formatNumber(result.skipped)} skipped
    </p>
  );
}

const SCOPES: { value: ScrapeScope; label: string; hint: string }[] = [
  { value: 'all', label: 'Everything', hint: 'World list, then items, then creatures. Takes the longest.' },
  { value: 'items', label: 'Items only', hint: 'Items and their NPC buyers.' },
  { value: 'creatures', label: 'Creatures only', hint: 'Creatures and loot. Run items first so loot can be linked.' },
];

export function ScraperPage() {
  const status = useScrapeStatus();
  const start = useStartScrape();
  const invalidateCatalog = useInvalidateCatalog();
  const toast = useToast();
  const [scope, setScope] = useState<ScrapeScope>('items');
  const previous = useRef<string | undefined>(undefined);
  const s = status.data;

  // When a run we were watching ends, refresh catalog screens and say how it went.
  useEffect(() => {
    const current = s?.status;
    if (previous.current === 'RUNNING' && current && current !== 'RUNNING') {
      invalidateCatalog();
      if (current === 'COMPLETED') toast.success('Scrape completed');
      else if (current === 'FAILED') toast.error('Scrape failed. Check the backend logs.');
    }
    previous.current = current;
  }, [s?.status, invalidateCatalog, toast]);

  const running = s?.status === 'RUNNING';
  const startError =
    getErrorStatus(start.error) === 409
      ? 'A scrape is already running. Its progress is shown below.'
      : start.error
        ? getApiErrorMessage(start.error)
        : null;

  return (
    <>
      <PageHeader
        back={{ to: '/admin', label: 'Admin panel' }}
        title="TibiaWiki scraper"
        description="Runs in the background on the server, one request every ~0.7 s. A full run can take a long time; you can leave this page."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader title="Start a run" />
          <div className="flex flex-col gap-4">
            <Select
              label="Scope"
              value={scope}
              onChange={(e) => setScope(e.target.value as ScrapeScope)}
              hint={SCOPES.find((x) => x.value === scope)?.hint}
              disabled={running}
            >
              {SCOPES.map((x) => (
                <option key={x.value} value={x.value}>
                  {x.label}
                </option>
              ))}
            </Select>
            <InlineError error={startError} />
            <Button
              onClick={() =>
                start.mutate(scope, { onSuccess: () => toast.success('Scrape started') })
              }
              loading={start.isPending}
              disabled={running}
            >
              <Play size={16} /> {running ? 'Running…' : 'Start scrape'}
            </Button>
          </div>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader
            title="Status"
            description={running ? 'Refreshing every 5 seconds.' : 'Status resets to Idle when the backend restarts.'}
            actions={
              <>
                {s && <Badge variant={SCRAPER_STATUS[s.status].variant}>{SCRAPER_STATUS[s.status].label}</Badge>}
                <Button variant="ghost" size="sm" onClick={() => status.refetch()} aria-label="Refresh status">
                  <RefreshCw size={14} className={status.isFetching ? 'animate-spin' : undefined} />
                </Button>
              </>
            }
          />
          {status.isLoading ? (
            <LoadingState rows={3} />
          ) : status.error ? (
            <ErrorState error={status.error} onRetry={() => status.refetch()} />
          ) : s ? (
            <div className="flex flex-col gap-4">
              <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-xs uppercase tracking-wide text-fg-muted">Started</dt>
                  <dd className="text-fg">{formatDateTime(s.startedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-fg-muted">Finished</dt>
                  <dd className="text-fg">{formatDateTime(s.completedAt)}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wide text-fg-muted">{running ? 'Elapsed' : 'Duration'}</dt>
                  <dd className="text-fg">
                    {s.result
                      ? `${formatNumber(Math.round(s.result.durationSeconds))} s`
                      : s.startedAt
                        ? formatElapsed(s.startedAt, s.completedAt)
                        : '—'}
                  </dd>
                </div>
              </dl>
              {running && (
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]" aria-hidden>
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-gold-gradient" />
                </div>
              )}
              {s.status === 'FAILED' && (
                <p className="rounded-xl border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
                  The last run stopped with an error. Data scraped before the error was kept; check the backend logs and
                  try again.
                </p>
              )}
              {s.result && (
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <StatCard label="Items scraped" metric={formatNumber(s.result.itemsScraped)} trend={`${formatNumber(s.result.itemsFailed)} failed`} />
                  <StatCard
                    label="Creatures scraped"
                    metric={formatNumber(s.result.creaturesScraped)}
                    trend={`${formatNumber(s.result.creaturesFailed)} failed`}
                  />
                  {s.result.servers && (
                    <StatCard
                      label="Worlds"
                      metric={formatNumber(s.result.servers.created + s.result.servers.updated)}
                      trend={`${formatNumber(s.result.servers.created)} new · ${formatNumber(s.result.servers.deactivated)} deactivated`}
                      className="md:col-span-2"
                    />
                  )}
                </div>
              )}
            </div>
          ) : null}
        </Card>
      </div>
    </>
  );
}
