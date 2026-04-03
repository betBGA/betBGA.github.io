import { ORACLE_FEE_USDT, USDT_DECIMALS, USDT_UNIT } from "./constants.js";

/**
 * Format a USDT base-unit amount (6 decimals) to a human-readable string.
 * e.g. 49_500000n → "49.5"
 *      10_000000n → "10"
 */
export function formatUsdt(amount) {
  const value = BigInt(amount);
  if (value < 0n) return "-" + formatUsdt(-value);

  const whole = value / USDT_UNIT;
  const frac = value % USDT_UNIT;
  if (frac === 0n) return whole.toString();

  const fracStr = frac
    .toString()
    .padStart(USDT_DECIMALS, "0")
    .replace(/0+$/, "");

  return `${whole}.${fracStr}`;
}

/**
 * Compute payouts exactly as the contract does (BigInt integer math).
 * amount     – per-player USDT amount in whole tokens (e.g. 20 = 20 USDT)
 * slotCount  – number of player slots
 * winnerCount – number of winners (≥ 1)
 * Returns { prizePool, oracleFee, payout, share } all in USDT base units.
 */
export function computePayouts(amount, slotCount, winnerCount) {
  const prizePool = BigInt(amount) * USDT_UNIT * BigInt(slotCount);
  const oracleFee = prizePool > 0n ? ORACLE_FEE_USDT : 0n;
  const payout = prizePool > oracleFee ? prizePool - oracleFee : 0n;
  const share = winnerCount > 0 ? payout / BigInt(winnerCount) : 0n;
  return { prizePool, oracleFee, payout, share };
}

/**
 * Convert a whole-USDT input ("5" to "250") into 6-decimal base units.
 */
export function wholeUsdtToBaseUnits(value) {
  return BigInt(value) * USDT_UNIT;
}

/**
 * Format a whole-token USDT amount stored by the contract.
 */
export function formatWholeUsdt(amount) {
  return BigInt(amount).toString();
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
