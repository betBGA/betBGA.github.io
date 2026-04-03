/**
 * Human-readable messages for contract custom errors.
 */
const CUSTOM_ERROR_MESSAGES = {
  NotParticipant: "You are not a participant in this bet.",
  SlotCountTooLow: "Need at least 2 player slots.",
  SlotCountTooHigh: "Maximum 10 player slots.",
  BetAmountTooLow: "Minimum bet is 5 USDT.",
  BetAmountTooHigh: "Maximum bet is 250 USDT.",
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
  IncorrectValue: "Do not send POL with this action — bets are paid in USDT.",
  TransferFailed: "USDT transfer failed. Please verify your balance and approval.",
  NewBetsDisabled: "New bets are currently paused. Existing bets are unaffected — please try again later.",
};

/**
 * Recursively dig through nested error objects to find hex revert data.
 * MetaMask wraps it as { code: -32603, data: { code: 3, data: "0x…" } }.
 * Other wallets may nest differently — this handles up to 5 levels deep.
 */
function findRevertData(obj, depth = 0) {
  if (!obj || depth > 5) return null;
  if (typeof obj === "string" && obj.startsWith("0x") && obj.length >= 10) return obj;
  if (typeof obj === "object") {
    if (typeof obj.data === "string" && obj.data.startsWith("0x") && obj.data.length >= 10) {
      return obj.data;
    }
    return findRevertData(obj.data, depth + 1);
  }
  return null;
}

/**
 * Collect all .message / .shortMessage strings from a (potentially deeply nested)
 * error object. Used to detect patterns like "insufficient funds" that wallets
 * bury inside inner error wrappers.
 */
function collectErrorMessages(err) {
  const msgs = [];
  const seen = new WeakSet();
  const queue = [err];
  while (queue.length) {
    const e = queue.shift();
    if (!e || typeof e !== "object" || seen.has(e)) continue;
    seen.add(e);
    if (typeof e.message === "string") msgs.push(e.message);
    if (typeof e.shortMessage === "string") msgs.push(e.shortMessage);
    if (e.info?.error) queue.push(e.info.error);
    if (e.error) queue.push(e.error);
    if (e.data && typeof e.data === "object") queue.push(e.data);
  }
  return msgs;
}

/**
 * Parse a contract error into a user-friendly message.
 * Attempts to decode custom errors from the ABI; falls back to reason/message.
 */
export function parseContractError(err, iface) {
  // Try decoding custom error from revert data — search the full error tree.
  // MetaMask nests it at err.info.error.data.data; other wallets vary.
  if (iface) {
    const revertHex =
      findRevertData(err) ||
      findRevertData(err?.info?.error) ||
      findRevertData(err?.error);
    if (revertHex) {
      try {
        const decoded = iface.parseError(revertHex);
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
  }

  // User rejected in wallet
  if (err?.code === "ACTION_REJECTED" || err?.code === 4001) {
    return "Transaction was rejected.";
  }

  // Insufficient funds — wallets bury this message inside nested error objects
  const allMsgs = collectErrorMessages(err).join(" ").toLowerCase();
  if (allMsgs.includes("insufficient funds") || allMsgs.includes("insufficient balance")) {
    return "Insufficient balance. You need enough USDT for the stake and enough POL for gas fees.";
  }

  // RPC / network errors — but NOT MetaMask's generic "Internal JSON-RPC error."
  // which wraps all call failures (reverts, insufficient funds, etc.), not just
  // network issues. That message contains "RPC" and would false-match here.
  if (err?.code === "NETWORK_ERROR" || err?.code === "SERVER_ERROR") {
    return "Network error — your wallet's RPC endpoint may be down. Try switching RPC in your wallet settings.";
  }
  const rpcMsg = err?.info?.error?.message || err?.error?.message || "";
  if (
    (rpcMsg.includes("endpoint") || rpcMsg.includes("rate limit")) &&
    !rpcMsg.includes("Internal JSON-RPC error")
  ) {
    return "Network error — your wallet's RPC endpoint may be down. Try switching RPC in your wallet settings.";
  }

  return err?.reason || err?.shortMessage || err?.message || "Transaction failed";
}

/**
 * Check whether an error looks like a transient RPC failure.
 */
function isRpcError(err) {
  const allMsgs = collectErrorMessages(err).join(" ");
  const rpcCode =
    err?.info?.error?.code || err?.error?.code || err?.code;
  return (
    allMsgs.includes("RPC") ||
    allMsgs.includes("endpoint") ||
    allMsgs.includes("could not coalesce") ||
    err?.code === "NETWORK_ERROR" ||
    err?.code === "SERVER_ERROR" ||
    err?.code === "UNKNOWN_ERROR" ||
    rpcCode === -32603 ||
    rpcCode === -32080
  );
}

/**
 * Wait for a transaction receipt using manual polling.
 *
 * ethers v6's tx.wait() uses an internal OnBlockSubscriber that throws
 * unhandled promise rejections when the wallet's RPC is flaky (common on
 * testnets). Manual polling via getTransactionReceipt avoids that entirely
 * and gives us full retry control.
 *
 * Polls every `intervalMs` for up to `maxAttempts` rounds (~2 min default).
 */
export async function waitForTx(tx, { maxAttempts = 60, intervalMs = 2000 } = {}) {
  const hash = tx.hash;
  const provider = tx.provider;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let receipt;
    try {
      receipt = await provider.getTransactionReceipt(hash);
    } catch (err) {
      // Throw non-RPC errors immediately
      if (!isRpcError(err)) throw err;
      // RPC errors are silently retried on the next iteration
    }

    if (receipt) {
      if (receipt.status === 0) {
        throw Object.assign(new Error("Transaction reverted on-chain."), { receipt });
      }
      return receipt;
    }

    await new Promise((r) => setTimeout(r, intervalMs));
  }

  throw new Error(
    "Transaction was sent but receipt polling timed out. " +
    "Check your wallet or the block explorer for tx: " + hash
  );
}

