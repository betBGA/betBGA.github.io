/**
 * Human-readable messages for contract custom errors.
 */
const CUSTOM_ERROR_MESSAGES = {
  NotParticipant: "You are not a participant in this bet.",
  SlotCountTooLow: "Need at least 2 player slots.",
  SlotCountTooHigh: "Maximum 10 player slots.",
  BetAmountTooLow: "Minimum bet is USDC 1.00.",
  BetAmountTooHigh: "Maximum bet is USDC 5,000.00.",
  InvalidTableId: "Enter a valid BGA table ID.",
  BetNotOpen: "This bet is not open for joining.",
  BetFull: "This bet is full.",
  InvalidPlayerId: "Enter a valid BGA player ID.",
  AlreadyParticipant: "You already joined this bet.",
  BetNotConfirming: "This bet is not in the confirming phase.",
  AlreadyConfirmed: "You already confirmed this bet.",
  CannotLeaveBet: "You can only leave while the bet is open or confirming.",
  BetNotLocked: "This bet is not locked.",
  AlreadyVotedCancel: "You already voted to cancel.",
  RefundTooEarly: "Refund is available 24 hours after the bet was locked.",
};

/**
 * Parse a contract error into a user-friendly message.
 * Attempts to decode custom errors from the ABI; falls back to reason/message.
 */
export function parseContractError(err, iface) {
  // Try decoding custom error from revert data
  if (iface && err?.data) {
    try {
      const decoded = iface.parseError(err.data);
      if (decoded && CUSTOM_ERROR_MESSAGES[decoded.name]) {
        return CUSTOM_ERROR_MESSAGES[decoded.name];
      }
      if (decoded) {
        return decoded.name.replace(/([A-Z])/g, " $1").trim();
      }
    } catch {
      // Not a recognized custom error, fall through
    }
  }

  // ethers v6 sometimes nests the actual error
  const inner = err?.info?.error || err?.error;
  if (inner && iface && inner.data) {
    try {
      const decoded = iface.parseError(inner.data);
      if (decoded && CUSTOM_ERROR_MESSAGES[decoded.name]) {
        return CUSTOM_ERROR_MESSAGES[decoded.name];
      }
      if (decoded) {
        return decoded.name.replace(/([A-Z])/g, " $1").trim();
      }
    } catch {
      // fall through
    }
  }

  // User rejected in wallet
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001) {
    return "Transaction was rejected.";
  }

  // RPC / network errors
  const rpcMsg = err?.info?.error?.message || err?.error?.message || "";
  if (
    rpcMsg.includes("RPC") ||
    rpcMsg.includes("endpoint") ||
    err?.code === "NETWORK_ERROR" ||
    err?.code === "SERVER_ERROR"
  ) {
    return "Network error — your wallet's RPC endpoint may be down. Try switching RPC in your wallet settings.";
  }

  const msg = err?.reason || err?.shortMessage || err?.message || "Transaction failed";

  return msg;
}

/**
 * Check whether an error looks like a transient RPC failure.
 */
function isRpcError(err) {
  const rpcMsg = err?.info?.error?.message || err?.error?.message || "";
  const rpcCode = err?.info?.error?.code || err?.error?.code;
  return (
    rpcMsg.includes("RPC") ||
    rpcMsg.includes("endpoint") ||
    err?.code === "NETWORK_ERROR" ||
    err?.code === "SERVER_ERROR" ||
    rpcCode === -32603 ||
    rpcCode === -32080
  );
}

/**
 * Wait for a transaction receipt with retries.
 * Testnet RPCs are flaky — the tx may be submitted successfully but
 * the receipt poll fails transiently. This retries before giving up.
 */
export async function waitForTx(tx, retries = 3) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await tx.wait();
    } catch (err) {
      if (isRpcError(err) && attempt < retries) {
        await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
        continue;
      }
      throw err;
    }
  }
}

