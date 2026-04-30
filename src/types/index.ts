// ── Enums ──────────────────────────────────────────────────────────────────

export type PvpType =
  | 'OPTIONAL_PVP'
  | 'OPEN_PVP'
  | 'RETRO_OPEN_PVP'
  | 'RETRO_HARDCORE_PVP'
  | 'HARDCORE_PVP';

export type Vocation = 'EK' | 'MS' | 'ED' | 'RP' | 'EM';

export type SaleDecision = 'KEEP' | 'SELL_NPC' | 'SELL_MARKET' | 'NO_PRICE';

export type ScraperStatus = 'IDLE' | 'RUNNING' | 'COMPLETED';

// ── Auth ───────────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string;
  username: string;
  role: 'USER' | 'ADMIN';
}

// ── Servers ────────────────────────────────────────────────────────────────

export interface ServerResponse {
  id: number;
  name: string;
  pvpType: PvpType;
  createdAt: string;
}

export interface ServerRequest {
  name: string;
  pvpType: PvpType;
}

// ── Characters ─────────────────────────────────────────────────────────────

export interface CharacterResponse {
  id: number;
  name: string;
  userId: number;
  serverId: number;
  serverName: string;
  vocation: Vocation | null;
  createdAt: string;
}

export interface CharacterRequest {
  name: string;
  serverId: number;
  vocation?: Vocation;
}

// ── Items ──────────────────────────────────────────────────────────────────

export interface NpcBuyerResponse {
  id: number;
  npcName: string;
  location: string | null;
  price: number;
}

export interface ItemResponse {
  id: number;
  name: string;
  wikiUrl: string | null;
  description: string | null;
  imageUrl: string | null;
  weight: number | null;
  category: string | null;
  isQuestItem: boolean;
  isImbuementMaterial: boolean;
  isDeliveryItem: boolean;
  isTaskItem: boolean;
  npcBuyers: NpcBuyerResponse[];
  updatedAt: string;
}

// ── Creatures ──────────────────────────────────────────────────────────────

export interface CreatureLootResponse {
  id: number;
  itemId: number;
  itemName: string;
  rarity: string | null;
  minAmount: number;
  maxAmount: number;
}

export interface CreatureResponse {
  id: number;
  name: string;
  wikiUrl: string | null;
  imageUrl: string | null;
  hp: number | null;
  experience: number | null;
  physicalResistance: number | null;
  fireResistance: number | null;
  iceResistance: number | null;
  energyResistance: number | null;
  earthResistance: number | null;
  deathResistance: number | null;
  holyResistance: number | null;
  drownResistance: number | null;
  loot: CreatureLootResponse[];
  updatedAt: string;
}

// ── Inventory ──────────────────────────────────────────────────────────────

export interface InventoryResponse {
  id: number;
  characterId: number;
  itemId: number;
  itemName: string;
  currentQuantity: number;
  targetQuantity: number;
  deficit: number;
  sellableQuantity: number;
  updatedAt: string;
}

export interface InventoryRequest {
  itemId: number;
  currentQuantity: number;
  targetQuantity: number;
}

// ── Sale Decision ──────────────────────────────────────────────────────────

export interface ItemDecisionResponse {
  itemId: number;
  itemName: string;
  isTaskItem: boolean;
  quantity: number;
  goalQuantity: number | null;
  surplusQuantity: number;
  npcBuyable: boolean;
  bestNpcPrice: number | null;
  marketPrice: number | null;
  decision: SaleDecision;
  estimatedValue: number;
  missingMarketPrice: boolean;
}

export interface SaleDecisionResponse {
  items: ItemDecisionResponse[];
  passiveGold: number;
  grossValue: number;
}

// ── Server Item Prices ─────────────────────────────────────────────────────

export interface ServerItemPriceResponse {
  id: number;
  serverId: number;
  itemId: number;
  itemName: string;
  marketPrice: number | null;
}

export interface ServerItemPriceRequest {
  itemId: number;
  serverId: number;
  marketPrice: number | null;
}

// ── Hunt Sessions ──────────────────────────────────────────────────────────

export interface HuntSessionItemResponse {
  id: number;
  itemId: number;
  itemName: string;
  quantity: number;
}

export interface HuntSessionMonsterResponse {
  id: number;
  creatureId: number;
  creatureName: string;
  killCount: number;
}

export interface HuntSessionResponse {
  id: number;
  characterId: number;
  name: string;
  location: string | null;
  isParty: boolean;
  notes: string | null;
  startedAt: string;
  endedAt: string;
  duration: string;
  rawXp: number;
  xpWithBonus: number;
  lootTotal: number;
  supplies: number;
  damage: number;
  healing: number;
  charLevel: number | null;
  allyEkLevel: number | null;
  allyMsLevel: number | null;
  allyEdLevel: number | null;
  allyRpLevel: number | null;
  allyEmLevel: number | null;
  items: HuntSessionItemResponse[];
  monsters: HuntSessionMonsterResponse[];
  skippedItems: string[];
  skippedMonsters: string[];
}

export interface HuntImportRequest {
  characterId: number;
  rawData: string;
  name?: string;
  location?: string;
  isParty?: boolean;
  notes?: string;
  charLevel?: number;
  allyEkLevel?: number;
  allyMsLevel?: number;
  allyEdLevel?: number;
  allyRpLevel?: number;
  allyEmLevel?: number;
}

// ── Admin / Scraper ────────────────────────────────────────────────────────

export interface ScraperResult {
  itemsScraped: number;
  itemsFailed: number;
  creaturesScraped: number;
  creaturesFailed: number;
  durationSeconds: number;
}

export interface ScrapeStatusResponse {
  status: ScraperStatus;
  startedAt: string | null;
  completedAt: string | null;
  result: ScraperResult | null;
}

// ── Error ──────────────────────────────────────────────────────────────────

export interface ApiError {
  status: number;
  error: string;
  message: string;
}
