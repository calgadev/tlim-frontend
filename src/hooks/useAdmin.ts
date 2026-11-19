import { useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getScrapeStatus, scrapeServers, startScrape } from '@/api/admin';
import type { ScrapeScope } from '@/types';
import { qk } from './queryKeys';

const POLL_INTERVAL_MS = 5_000;

/** Polls every 5 s while a scrape is RUNNING; idle otherwise. */
export function useScrapeStatus() {
  return useQuery({
    queryKey: qk.admin.scrapeStatus,
    queryFn: getScrapeStatus,
    staleTime: 0,
    refetchInterval: (query) => (query.state.data?.status === 'RUNNING' ? POLL_INTERVAL_MS : false),
  });
}

export function useStartScrape() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (scope: ScrapeScope) => startScrape(scope),
    onSuccess: (status) => qc.setQueryData(qk.admin.scrapeStatus, status),
    // A 409 means another run is in progress; refresh so polling picks it up.
    onError: () => qc.invalidateQueries({ queryKey: qk.admin.scrapeStatus }),
  });
}

export function useScrapeServers() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: scrapeServers,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.servers.all });
      qc.invalidateQueries({ queryKey: qk.characters.all });
    },
  });
}

/** Call when a scrape finishes so catalog screens show the new data. */
export function useInvalidateCatalog() {
  const qc = useQueryClient();
  return useCallback(() => {
    qc.invalidateQueries({ queryKey: qk.items.all });
    qc.invalidateQueries({ queryKey: qk.creatures.all });
    qc.invalidateQueries({ queryKey: qk.servers.all });
    qc.invalidateQueries({ queryKey: ['inventory'] });
  }, [qc]);
}
