import { ORACLE_FEE_BPS, ONE_POL } from "./constants.js";

/**
 * Format a wei amount (BigInt) to a human-readable POL string.
 * e.g. 49_500000000000000000n → "49.5"
 *      10_000000000000000000n → "10"
 */
export function formatPol(wei) {
  const w = BigInt(wei);
  const whole = w / ONE_POL;
  const frac = w % ONE_POL;
  if (frac === 0n) return whole.toString();
  // Up to 4 significant decimal digits, strip trailing zeros
  const fracStr = frac.toString().padStart(18, "0").slice(0, 4).replace(/0+$/, "");
  return `${whole}.${fracStr}`;
}

/**
 * Compute payouts exactly as the contract does (BigInt integer math).
 * amount     – whole POL integer (e.g. 10)
 * slotCount  – number of player slots
 * winnerCount – number of winners (≥ 1)
 * Returns { prizePool, oracleFee, payout, share } all in wei (BigInt).
 */
export function computePayouts(amount, slotCount, winnerCount) {
  const prizePool = BigInt(amount) * ONE_POL * BigInt(slotCount);
  const oracleFee = prizePool * ORACLE_FEE_BPS / 10000n;
  const payout = prizePool - oracleFee;
  const share = payout / BigInt(winnerCount);
  return { prizePool, oracleFee, payout, share };
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
    createdAtBlock: Number(raw.createdAtBlock),
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
