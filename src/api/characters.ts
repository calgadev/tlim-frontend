import client from './client';
import type {
  CharacterRequest,
  CharacterResponse,
  DecisionQuery,
  HuntImportFormat,
  HuntImportRequest,
  HuntSessionResponse,
  InventoryRequest,
  InventoryResponse,
  SaleDecisionResponse,
  ServerItemPriceRequest,
  ServerItemPriceResponse,
} from '@/types';

// Everything here belongs to the signed-in user (characters, their inventory and hunts)
// or is user-editable per server (market prices).

// ─── Characters ───────────────────────────────────────────────────────────────

export async function getCharacters(): Promise<CharacterResponse[]> {
  const { data } = await client.get<CharacterResponse[]>('/api/characters');
  return data;
}

export async function getCharacter(id: number): Promise<CharacterResponse> {
  const { data } = await client.get<CharacterResponse>(`/api/characters/${id}`);
  return data;
}

export async function createCharacter(body: CharacterRequest): Promise<CharacterResponse> {
  const { data } = await client.post<CharacterResponse>('/api/characters', body);
  return data;
}

export async function updateCharacter(id: number, body: CharacterRequest): Promise<CharacterResponse> {
  const { data } = await client.put<CharacterResponse>(`/api/characters/${id}`, body);
  return data;
}

export async function deleteCharacter(id: number): Promise<void> {
  await client.delete(`/api/characters/${id}`);
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export async function getInventory(characterId: number): Promise<InventoryResponse[]> {
  const { data } = await client.get<InventoryResponse[]>(`/api/inventory/characters/${characterId}`);
  return data;
}

/** Creates or updates the row for (character, item). */
export async function upsertInventory(characterId: number, body: InventoryRequest): Promise<InventoryResponse> {
  const { data } = await client.post<InventoryResponse>(`/api/inventory/characters/${characterId}`, body);
  return data;
}

export async function deleteInventoryEntry(id: number): Promise<void> {
  await client.delete(`/api/inventory/${id}`);
}

export async function getSaleDecisions(characterId: number, query: DecisionQuery = {}): Promise<SaleDecisionResponse> {
  const { data } = await client.get<SaleDecisionResponse>(
    `/api/inventory/characters/${characterId}/decisions`,
    { params: { decision: query.decision, sortBy: query.sortBy } }
  );
  return data;
}

// ─── Hunt sessions ────────────────────────────────────────────────────────────

export async function getHuntSessions(characterId: number, location?: string): Promise<HuntSessionResponse[]> {
  const { data } = await client.get<HuntSessionResponse[]>(`/api/hunt-sessions/characters/${characterId}`, {
    params: location?.trim() ? { location: location.trim() } : undefined,
  });
  return data;
}

export async function getHuntSession(id: number): Promise<HuntSessionResponse> {
  const { data } = await client.get<HuntSessionResponse>(`/api/hunt-sessions/${id}`);
  return data;
}

/** Also adds the looted items to the character's inventory. */
export async function importHuntSession(format: HuntImportFormat, body: HuntImportRequest): Promise<HuntSessionResponse> {
  const { data } = await client.post<HuntSessionResponse>(`/api/hunt-sessions/import/${format}`, body);
  return data;
}

/** Also subtracts the session's loot from the inventory (never below 0). */
export async function deleteHuntSession(id: number): Promise<void> {
  await client.delete(`/api/hunt-sessions/${id}`);
}

// ─── Market prices ────────────────────────────────────────────────────────────

/** Only items that have a price row on this server. */
export async function getServerPrices(serverId: number): Promise<ServerItemPriceResponse[]> {
  const { data } = await client.get<ServerItemPriceResponse[]>(`/api/servers/${serverId}/item-prices`);
  return data;
}

export async function setServerPrice(
  serverId: number,
  itemId: number,
  body: ServerItemPriceRequest
): Promise<ServerItemPriceResponse> {
  const { data } = await client.put<ServerItemPriceResponse>(`/api/servers/${serverId}/item-prices/${itemId}`, body);
  return data;
}
