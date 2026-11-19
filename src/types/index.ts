// Shapes of the tlim-java REST API (Stage 2). Dates are ISO-8601 strings (Java Instant).
// `| null` mirrors nullable Java fields; optional (`?`) request fields may be omitted.

// ─── Enums ────────────────────────────────────────────────────────────────────

export type Role = 'USER' | 'ADMIN';

export type PvpType =
  | 'OPTIONAL_PVP'
  | 'OPEN_PVP'
  | 'RETRO_OPEN_PVP'
  | 'RETRO_HARDCORE_PVP'
  | 'HARDCORE_PVP';

export type Vocation = 'EK' | 'MS' | 'ED' | 'RP' | 'EM';

export type SaleDecision = 'KEEP' | 'SELL_NPC' | 'SELL_MARKET' | 'NO_PRICE';

export type DecisionSort = 'value' | 'name';

export type ScraperStatus = 'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED';

export type ScrapeScope = 'all' | 'items' | 'creatures';

export type HuntImportFormat = 'text' | 'json';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  username: string;
  password: string;
}

/** username: 3–50 chars, [a-zA-Z0-9_]; password: 8–100 chars */
export interface RegisterRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: Role;
}

// ─── Errors ───────────────────────────────────────────────────────────────────

/** Body of every error response. Validation errors carry only the first failing field. */
export interface ApiError {
  status: number;
  error: string;
  message: string;
}

// ─── Servers (official Tibia worlds) ──────────────────────────────────────────

export interface ServerResponse {
  id: number;
  name: string;
  pvpType: PvpType;
  location: string | null;
  /** false when the world left the official list; kept because characters may reference it */
  active: boolean;
  createdAt: string;
}

export interface ServerRequest {
  name: string;
  pvpType: PvpType;
  location?: string | null;
}

// ─── Characters ───────────────────────────────────────────────────────────────

export interface CharacterResponse {
  id: number;
  name: string;
  userId: number;
  serverId: number;
  serverName: string;
  vocation: Vocation | null;
  createdAt: string;
}

/** name: 2–100 chars, letters and spaces only */
export interface CharacterRequest {
  name: string;
  serverId: number;
  vocation?: Vocation | null;
}

// ─── Items ────────────────────────────────────────────────────────────────────

export interface NpcBuyerResponse {
  id: number;
  npcName: string;
  location: string | null;
  price: number;
}

export interface ItemResponse {
  id: number;
  name: string;
  /** lowercase in-game name used to match Hunt Analyser entries */
  actualName: string | null;
  wikiUrl: string | null;
  description: string | null;
  imageUrl: string | null;
  weight: number | null;
  /** free text from TibiaWiki, not an enum */
  category: string | null;
  isQuestItem: boolean;
  isImbuementMaterial: boolean;
  isDeliveryItem: boolean;
  isTaskItem: boolean;
  npcBuyers: NpcBuyerResponse[];
  updatedAt: string;
}

export interface ItemQuery {
  name?: string;
  category?: string;
  limit?: number;
}

// ─── Creatures ────────────────────────────────────────────────────────────────

export interface CreatureLootResponse {
  id: number;
  itemId: number;
  itemName: string;
  /** free text from TibiaWiki, e.g. "semi-rare" */
  rarity: string | null;
  minAmount: number;
  maxAmount: number;
}

export interface CreatureResponse {
  id: number;
  name: string;
  actualName: string | null;
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
  /** always empty in the list endpoint; filled only by GET /api/creatures/{id} */
  loot: CreatureLootResponse[];
  updatedAt: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryResponse {
  id: number;
  characterId: number;
  itemId: number;
  itemName: string;
  currentQuantity: number;
  /** 0 means "no goal" */
  targetQuantity: number;
  /** max(0, target − current) */
  deficit: number;
  /** max(0, current − target) */
  sellableQuantity: number;
  updatedAt: string;
}

/** Upsert by (character, item) */
export interface InventoryRequest {
  itemId: number;
  currentQuantity: number;
  targetQuantity: number;
}

// ─── Sale decision engine ─────────────────────────────────────────────────────

export interface ItemDecisionResponse {
  itemId: number;
  itemName: string;
  isTaskItem: boolean;
  quantity: number;
  /** null when the target is 0 */
  goalQuantity: number | null;
  surplusQuantity: number;
  npcBuyable: boolean;
  bestNpcPrice: number | null;
  marketPrice: number | null;
  decision: SaleDecision;
  /** unit price used for estimatedValue (NPC or market, depending on the decision) */
  sellingPrice: number;
  estimatedValue: number;
  /** an NPC buys it but no market price is registered yet, so the comparison is incomplete */
  missingMarketPrice: boolean;
}

export interface SaleDecisionResponse {
  characterId: number;
  /** the character's own server, whose market prices were used */
  serverId: number;
  items: ItemDecisionResponse[];
  /** Σ estimatedValue of the whole inventory (not affected by the decision filter) */
  passiveGold: number;
  /** Σ quantity × best price of the whole inventory */
  grossValue: number;
}

export interface DecisionQuery {
  decision?: SaleDecision;
  sortBy?: DecisionSort;
}

// ─── Market prices (per server) ───────────────────────────────────────────────

export interface ServerItemPriceResponse {
  id: number;
  serverId: number;
  itemId: number;
  itemName: string | null;
  /** null = not registered yet; 0 = known to be worthless */
  marketPrice: number | null;
}

/** PUT /api/servers/{serverId}/item-prices/{itemId}; null clears the price */
export interface ServerItemPriceRequest {
  marketPrice: number | null;
}

// ─── Hunt sessions ────────────────────────────────────────────────────────────

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
  /** as printed by the Hunt Analyser, e.g. "00:10h" */
  duration: string;
  rawXp: number;
  xpWithBonus: number;
  lootTotal: number;
  supplies: number;
  /** lootTotal − supplies */
  balance: number;
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
  /** names not found in the catalog; only filled in the import response */
  skippedItems: string[];
  skippedMonsters: string[];
}

export interface HuntImportRequest {
  characterId: number;
  /** Hunt Analyser export pasted as-is (text or JSON, matching the endpoint) */
  rawData: string;
  name?: string | null;
  location?: string | null;
  isParty?: boolean | null;
  notes?: string | null;
  charLevel?: number | null;
  allyEkLevel?: number | null;
  allyMsLevel?: number | null;
  allyEdLevel?: number | null;
  allyRpLevel?: number | null;
  allyEmLevel?: number | null;
}

// ─── Admin / scraper ──────────────────────────────────────────────────────────

export interface ServerScrapeResult {
  created: number;
  updated: number;
  deactivated: number;
  skipped: number;
}

export interface ScraperResult {
  servers: ServerScrapeResult | null;
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
