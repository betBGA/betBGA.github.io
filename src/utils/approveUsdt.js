import { BETBGA_ADDRESS, TOKEN_SYMBOL } from "./constants.js";
import { formatUsdt } from "./format.js";
import { waitForTx } from "./contract.js";

/**
 * Ensure the BetBGA contract has exactly `amountBaseUnits` USDT allowance
 * from `owner`.
 *
 * - Checks wallet balance first and throws if insufficient.
 * - Skips approval entirely if existing allowance already matches.
 * - Resets to 0 first if a different non-zero allowance exists (standard
 *   USDT behaviour requires this before setting a new non-zero value).
 *
 * @param {object}  opts
 * @param {import("ethers").Contract} opts.readUsdtContract  read-only USDT contract
 * @param {import("ethers").Contract} opts.usdtContract       signer-attached USDT contract
 * @param {string}  opts.owner           wallet address
 * @param {bigint}  opts.amountBaseUnits amount in 6-decimal base units
 * @throws {Error} if balance is insufficient
 */
export async function ensureUsdtApproval({
  readUsdtContract,
  usdtContract,
  owner,
  amountBaseUnits,
}) {
  const balance = await readUsdtContract.balanceOf(owner);
  if (balance < amountBaseUnits) {
    throw new Error(
      `Insufficient balance — you need ${formatUsdt(amountBaseUnits)} ${TOKEN_SYMBOL} and a little POL for gas.`
    );
  }

  const allowance = await readUsdtContract.allowance(owner, BETBGA_ADDRESS);

  // Already approved the exact amount — no extra tx needed
  if (allowance === amountBaseUnits) return;

  // Reset to 0 first if a different non-zero allowance exists (USDT compat)
  if (allowance > 0n) {
    const resetTx = await usdtContract.approve(BETBGA_ADDRESS, 0n);
    await waitForTx(resetTx);
  }

  const approveTx = await usdtContract.approve(BETBGA_ADDRESS, amountBaseUnits);
  await waitForTx(approveTx);
}

