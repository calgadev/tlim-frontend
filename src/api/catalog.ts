import client from './client';
import type {
  CreatureResponse,
  ItemQuery,
  ItemResponse,
  ServerRequest,
  ServerResponse,
} from '@/types';

// Servers, items and creatures form the shared catalog: anyone signed in can read it,
// only ADMIN can change it.

// ─── Servers ──────────────────────────────────────────────────────────────────

export async function getServers(includeInactive = false): Promise<ServerResponse[]> {
  const { data } = await client.get<ServerResponse[]>('/api/servers', {
    params: includeInactive ? { includeInactive: true } : undefined,
  });
  return data;
}

export async function getServer(id: number): Promise<ServerResponse> {
  const { data } = await client.get<ServerResponse>(`/api/servers/${id}`);
  return data;
}

export async function createServer(body: ServerRequest): Promise<ServerResponse> {
  const { data } = await client.post<ServerResponse>('/api/servers', body);
  return data;
}

export async function updateServer(id: number, body: ServerRequest): Promise<ServerResponse> {
  const { data } = await client.put<ServerResponse>(`/api/servers/${id}`, body);
  return data;
}

export async function deleteServer(id: number): Promise<void> {
  await client.delete(`/api/servers/${id}`);
}

// ─── Items ────────────────────────────────────────────────────────────────────

export async function getItems(query: ItemQuery): Promise<ItemResponse[]> {
  const params: Record<string, string | number> = {};
  if (query.name?.trim()) params.name = query.name.trim();
  if (query.category?.trim()) params.category = query.category.trim();
  if (query.limit) params.limit = query.limit;
  const { data } = await client.get<ItemResponse[]>('/api/items', { params });
  // Backends older than the ?limit= parameter ignore it, so cap on the client too.
  return query.limit ? data.slice(0, query.limit) : data;
}

export async function getItem(id: number): Promise<ItemResponse> {
  const { data } = await client.get<ItemResponse>(`/api/items/${id}`);
  return data;
}

// ─── Creatures ────────────────────────────────────────────────────────────────

/** Loot is always empty in this list; use getCreature for the loot table. */
export async function getCreatures(): Promise<CreatureResponse[]> {
  const { data } = await client.get<CreatureResponse[]>('/api/creatures');
  return data;
}

export async function getCreature(id: number): Promise<CreatureResponse> {
  const { data } = await client.get<CreatureResponse>(`/api/creatures/${id}`);
  return data;
}
