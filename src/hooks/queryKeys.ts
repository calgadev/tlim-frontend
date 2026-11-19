import type { DecisionQuery, ItemQuery } from '@/types';

// Hierarchical keys: invalidating a prefix (e.g. qk.inventory.all(characterId)) also covers
// every more specific key below it.
export const qk = {
  servers: {
    all: ['servers'] as const,
    list: (includeInactive: boolean) => ['servers', 'list', { includeInactive }] as const,
    detail: (id: number) => ['servers', 'detail', id] as const,
  },
  items: {
    all: ['items'] as const,
    search: (query: ItemQuery) => ['items', 'search', query] as const,
    detail: (id: number) => ['items', 'detail', id] as const,
  },
  creatures: {
    all: ['creatures'] as const,
    list: ['creatures', 'list'] as const,
    detail: (id: number) => ['creatures', 'detail', id] as const,
  },
  characters: {
    all: ['characters'] as const,
    list: ['characters', 'list'] as const,
    detail: (id: number) => ['characters', 'detail', id] as const,
  },
  inventory: {
    all: (characterId: number) => ['inventory', characterId] as const,
    list: (characterId: number) => ['inventory', characterId, 'list'] as const,
    decisions: (characterId: number, query: DecisionQuery) =>
      ['inventory', characterId, 'decisions', query] as const,
  },
  hunts: {
    all: ['hunts'] as const,
    list: (characterId: number, location: string) => ['hunts', 'list', characterId, location] as const,
    detail: (id: number) => ['hunts', 'detail', id] as const,
  },
  prices: {
    all: ['prices'] as const,
    list: (serverId: number) => ['prices', serverId] as const,
  },
  admin: {
    scrapeStatus: ['admin', 'scrape-status'] as const,
  },
};
