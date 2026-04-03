// betBGA contract address on Polygon Amoy testnet
export const BETBGA_ADDRESS = "0x0fF0d5F2C6B64d0ba19C812Bf9B7d3045d8AC0C6";

// USDT token used for betting on Polygon Amoy
export const USDT_ADDRESS = "0xD298b149e34CDeF04bF1FCb0BD6612726f78aB4B";
export const TOKEN_SYMBOL = "USDT";
export const USDT_DECIMALS = 6;
export const USDT_UNIT = 10n ** BigInt(USDT_DECIMALS);

// Polygon Amoy testnet chain config
export const POLYGON_CHAIN_ID = 80002;
export const POLYGON_CHAIN_ID_HEX = "0x13882";

// Default RPC endpoints (user can reorder / add / remove via settings)
export const DEFAULT_RPC_URLS = [
  "https://polygon-amoy.drpc.org",
  "https://rpc-amoy.polygon.technology",
  "https://polygon-amoy-bor-rpc.publicnode.com",
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
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "POL", symbol: "POL", decimals: 18 },
  blockExplorerUrls: ["https://amoy.polygonscan.com/"],
};

// Block explorer base URL (without trailing slash)
export const BLOCK_EXPLORER_URL = "https://amoy.polygonscan.com";

// Unstoppable Domains ProxyReader on Polygon Amoy (may not be available on testnet)
export const UD_PROXY_READER = "0xa9a6A3626993D487d2Dbda3173cf58cA1a9D9e9f";

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

