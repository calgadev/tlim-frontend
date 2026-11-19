import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCharacter,
  deleteCharacter,
  deleteHuntSession,
  deleteInventoryEntry,
  getCharacter,
  getCharacters,
  getHuntSession,
  getHuntSessions,
  getInventory,
  getSaleDecisions,
  getServerPrices,
  importHuntSession,
  setServerPrice,
  updateCharacter,
  upsertInventory,
} from '@/api/characters';
import type {
  CharacterRequest,
  DecisionQuery,
  HuntImportFormat,
  HuntImportRequest,
  InventoryRequest,
} from '@/types';
import { qk } from './queryKeys';

// ─── Characters ───────────────────────────────────────────────────────────────

export function useCharacters() {
  return useQuery({ queryKey: qk.characters.list, queryFn: getCharacters });
}

export function useCharacter(id: number) {
  return useQuery({ queryKey: qk.characters.detail(id), queryFn: () => getCharacter(id) });
}

export function useSaveCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id?: number; body: CharacterRequest }) =>
      id ? updateCharacter(id, body) : createCharacter(body),
    onSuccess: (character) => {
      qc.invalidateQueries({ queryKey: qk.characters.all });
      // A server change switches which market prices the decision engine uses
      qc.invalidateQueries({ queryKey: qk.inventory.all(character.id) });
    },
  });
}

export function useDeleteCharacter() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCharacter(id),
    onSuccess: (_, id) => {
      qc.removeQueries({ queryKey: qk.characters.detail(id) });
      qc.removeQueries({ queryKey: qk.inventory.all(id) });
      qc.invalidateQueries({ queryKey: qk.characters.list });
      qc.invalidateQueries({ queryKey: qk.hunts.all });
    },
  });
}

// ─── Inventory and decisions ──────────────────────────────────────────────────

export function useInventory(characterId: number) {
  return useQuery({ queryKey: qk.inventory.list(characterId), queryFn: () => getInventory(characterId) });
}

export function useSaleDecisions(characterId: number, query: DecisionQuery = {}) {
  return useQuery({
    queryKey: qk.inventory.decisions(characterId, query),
    queryFn: () => getSaleDecisions(characterId, query),
    placeholderData: keepPreviousData,
  });
}

/** Invalidates the list and every decision view of the character. */
export function useUpsertInventory(characterId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: InventoryRequest) => upsertInventory(characterId, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.inventory.all(characterId) }),
  });
}

export function useDeleteInventoryEntry(characterId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteInventoryEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: qk.inventory.all(characterId) }),
  });
}

// ─── Hunt sessions ────────────────────────────────────────────────────────────

export function useHuntSessions(characterId: number, location = '') {
  return useQuery({
    queryKey: qk.hunts.list(characterId, location.trim()),
    queryFn: () => getHuntSessions(characterId, location),
    placeholderData: keepPreviousData,
  });
}

export function useHuntSession(id: number) {
  return useQuery({ queryKey: qk.hunts.detail(id), queryFn: () => getHuntSession(id) });
}

/** Importing adds the loot to the inventory, so inventory and decisions are refreshed too. */
export function useImportHunt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ format, body }: { format: HuntImportFormat; body: HuntImportRequest }) =>
      importHuntSession(format, body),
    onSuccess: (session) => {
      qc.invalidateQueries({ queryKey: qk.hunts.all });
      qc.invalidateQueries({ queryKey: qk.inventory.all(session.characterId) });
    },
  });
}

/** Deleting subtracts the loot from the inventory again. */
export function useDeleteHunt() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id }: { id: number; characterId: number }) => deleteHuntSession(id),
    onSuccess: (_, { id, characterId }) => {
      qc.removeQueries({ queryKey: qk.hunts.detail(id) });
      qc.invalidateQueries({ queryKey: qk.hunts.all });
      qc.invalidateQueries({ queryKey: qk.inventory.all(characterId) });
    },
  });
}

// ─── Market prices ────────────────────────────────────────────────────────────

export function useServerPrices(serverId: number) {
  return useQuery({ queryKey: qk.prices.list(serverId), queryFn: () => getServerPrices(serverId) });
}

/** Prices feed the decision engine of every character on that server. */
export function useSetServerPrice(serverId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, marketPrice }: { itemId: number; marketPrice: number | null }) =>
      setServerPrice(serverId, itemId, { marketPrice }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: qk.prices.list(serverId) });
      qc.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
