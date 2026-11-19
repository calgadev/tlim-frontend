import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createServer,
  deleteServer,
  getCreature,
  getCreatures,
  getItem,
  getItems,
  getServer,
  getServers,
  updateServer,
} from '@/api/catalog';
import type { ItemQuery, ServerRequest } from '@/types';
import { qk } from './queryKeys';

// The catalog changes only when an admin edits it or the scraper runs, so it can stay fresh longer.
const CATALOG_STALE = 5 * 60_000;

// ─── Servers ──────────────────────────────────────────────────────────────────

export function useServers(includeInactive = false) {
  return useQuery({
    queryKey: qk.servers.list(includeInactive),
    queryFn: () => getServers(includeInactive),
    staleTime: CATALOG_STALE,
  });
}

export function useServer(id: number | null) {
  return useQuery({
    queryKey: qk.servers.detail(id ?? 0),
    queryFn: () => getServer(id!),
    enabled: id !== null,
    staleTime: CATALOG_STALE,
  });
}

export function useSaveServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: ServerRequest }) =>
      id ? updateServer(id, body) : createServer(body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.servers.all });
      // Characters show the server name
      qc.invalidateQueries({ queryKey: qk.characters.all });
    },
  });
}

export function useDeleteServer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteServer(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.servers.all }),
  });
}

// ─── Items ────────────────────────────────────────────────────────────────────

/** Never fetches the whole catalog: disabled until there is a name (2+ chars) or a category. */
export function useItemSearch(query: ItemQuery) {
  const name = query.name?.trim() ?? '';
  const category = query.category?.trim() ?? '';
  const normalized: ItemQuery = { name, category, limit: query.limit };
  return useQuery({
    queryKey: qk.items.search(normalized),
    queryFn: () => getItems(normalized),
    enabled: name.length >= 2 || category.length > 0,
    staleTime: CATALOG_STALE,
    placeholderData: keepPreviousData,
  });
}

export function useItem(id: number) {
  return useQuery({
    queryKey: qk.items.detail(id),
    queryFn: () => getItem(id),
    staleTime: CATALOG_STALE,
  });
}

// ─── Creatures ────────────────────────────────────────────────────────────────

export function useCreatures() {
  return useQuery({
    queryKey: qk.creatures.list,
    queryFn: getCreatures,
    staleTime: CATALOG_STALE,
  });
}

export function useCreature(id: number) {
  return useQuery({
    queryKey: qk.creatures.detail(id),
    queryFn: () => getCreature(id),
    staleTime: CATALOG_STALE,
  });
}
