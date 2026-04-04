// betBGA contract address on Polygon mainnet
export const BETBGA_ADDRESS = "0x08407Cd9366e645D39eF60039e2f53a3038CB7bA";

// USDT token used for betting on Polygon
export const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const TOKEN_SYMBOL = "USDT";
export const USDT_DECIMALS = 6;
export const USDT_UNIT = 10n ** BigInt(USDT_DECIMALS);

// Polygon mainnet chain config
export const POLYGON_CHAIN_ID = 137;
export const POLYGON_CHAIN_ID_HEX = "0x89";

// Default RPC endpoints (user can reorder / add / remove via settings)
export const DEFAULT_RPC_URLS = [
  "https://polygon.drpc.org",
  "https://polygon-bor-rpc.publicnode.com",
  "https://1rpc.io/matic",
];

// localStorage key for persisted RPC list
const RPC_STORAGE_KEY = "bgamble:rpcUrls";

/** Read the user's RPC list from localStorage, falling back to defaults. */
export function getRpcUrls() {
  try {
    const raw = localStorage.getItem(RPC_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((u) => typeof u === "string")) {
        return parsed;
      }
    }
  } catch { /* ignore corrupt data */ }
  return [...DEFAULT_RPC_URLS];
}

/** Persist the user's RPC list to localStorage. */
export function saveRpcUrls(urls) {
  localStorage.setItem(RPC_STORAGE_KEY, JSON.stringify(urls));
}

// Static chain config *without* rpcUrls — callers spread in the live list.
export const POLYGON_CHAIN_CONFIG = {
  chainId: POLYGON_CHAIN_ID_HEX,
  chainName: "Polygon",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  blockExplorerUrls: ["https://polygonscan.com/"],
};

// Block explorer base URL (without trailing slash)
export const BLOCK_EXPLORER_URL = "https://polygonscan.com";

// Unstoppable Domains ProxyReader on Polygon
export const UD_PROXY_READER = "0xc3C2BAB5e3e52DBF311b2aAcEf2e40344f19494E";

// Bet states enum (matches Solidity)
export const BetState = {
  Open: 0,
  Confirming: 1,
  Locked: 2,
  Resolved: 3,
  NoConsensus: 4,
  Cancelled: 5,
  Refunded: 6,
};

export const BET_STATE_NAMES = ["Open", "Confirming", "Locked", "Resolved", "No Consensus", "Cancelled", "Refunded"];

// Stake limits (whole USDT only in the UI)
export const MIN_BET_AMOUNT_USDT = 5;
export const MAX_BET_AMOUNT_USDT = 250;

// Flat oracle fee charged only on successful resolutions (base units, i.e. 0.50 USDT)
export const ORACLE_FEE_USDT = 500_000n;

// Polling interval for bet updates (ms)
export const POLL_INTERVAL = 5000;

