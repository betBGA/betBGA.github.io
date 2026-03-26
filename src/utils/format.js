/**
 * Format a USDC amount (6 decimals) to a human-readable string.
 * e.g. 10000000n → "10.00"
 */
export function formatUsdc(amount) {
  const n = Number(amount);
  return (n / 1_000_000).toFixed(2);
}

/**
 * Parse a human-readable USDC string to the 6-decimal integer.
 * e.g. "10.50" → 10500000
 */
export function parseUsdc(str) {
  const num = parseFloat(str);
  if (isNaN(num) || num < 0) return 0;
  return Math.round(num * 1_000_000);
}

/**
 * Truncate an Ethereum address for display.
 * e.g. "0x1234...abcd"
 */
export function truncateAddress(addr) {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/**
 * Get the BGA table URL.
 */
export function bgaTableUrl(tableId) {
  return `https://boardgamearena.com/table?table=${tableId}`;
}

/**
 * Get the BGA player profile URL.
 */
export function bgaPlayerUrl(playerId) {
  return `https://boardgamearena.com/player?id=${playerId}`;
}

/**
 * Get Robohash avatar URL for an address.
 */
export function roboHashUrl(address) {
  return `https://robohash.org/${address.toLowerCase()}?set=set3&size=120x120`;
}

/**
 * Convert a bet summary from ethers result to a plain object.
 */
export function parseBetSummary(raw) {
  return {
    betId: Number(raw.betId),
    bgaTableId: Number(raw.bgaTableId),
    slotCount: Number(raw.slotCount),
    confirmCount: Number(raw.confirmCount),
    cancelVoteCount: Number(raw.cancelVoteCount),
    state: Number(raw.state),
    amount: Number(raw.amount),
    lockedAt: Number(raw.lockedAt),
    participants: raw.participants.map((p) => ({
      addr: p.addr,
      predictedWinner: Number(p.predictedWinner),
      confirmed: p.confirmed,
      cancelVote: p.cancelVote,
    })),
    resolvedWinnerIds: raw.resolvedWinnerIds
      ? raw.resolvedWinnerIds.map((id) => Number(id))
      : [],
  };
}


