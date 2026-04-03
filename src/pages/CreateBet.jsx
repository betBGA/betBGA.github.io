import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet.js";
import { useToast } from "../hooks/useToast.js";
import { parseContractError, waitForTx } from "../utils/contract.js";
import { ensureUsdtApproval } from "../utils/approveUsdt.js";
import {
  MAX_BET_AMOUNT_USDT,
  MIN_BET_AMOUNT_USDT,
  TOKEN_SYMBOL,
} from "../utils/constants.js";
import { wholeUsdtToBaseUnits } from "../utils/format.js";
import { WalletOverlay } from "../components/WalletOverlay.jsx";
import "./CreateBet.css";

export function CreateBet() {
  const { contract, usdtContract, readContract, readUsdtContract, isConnected, address } = useWallet();
  const { addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [bgaTableId, setBgaTableId] = useState("");
  const [amount, setAmount] = useState("20");
  const [slotCount, setSlotCount] = useState("2");
  const [predictedWinner, setPredictedWinner] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [txLabel, setTxLabel] = useState("");
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    let cancelled = false;
    readContract.acceptingNewBets().then((accepting) => {
      if (!cancelled) setPaused(!accepting);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [readContract]);


  async function handleSubmit(e) {
    e.preventDefault();
    if (!isConnected || !contract || !usdtContract || !readUsdtContract || !address) {
      addToast("Please connect your wallet first.", "error");
      return;
    }

    const tableId = parseInt(bgaTableId, 10);
    const slots = parseInt(slotCount, 10);
    const winnerId = parseInt(predictedWinner, 10);
    const amountUsdt = parseInt(amount, 10);

    if (!tableId || tableId <= 0) {
      addToast("Enter a valid BGA table ID.", "error");
      return;
    }
    if (!winnerId || winnerId <= 0) {
      addToast("Enter a valid BGA player ID for your predicted winner.", "error");
      return;
    }
    if (!Number.isInteger(amountUsdt) || amountUsdt < MIN_BET_AMOUNT_USDT) {
      addToast(`Minimum bet is ${MIN_BET_AMOUNT_USDT} ${TOKEN_SYMBOL}.`, "error");
      return;
    }
    if (amountUsdt > MAX_BET_AMOUNT_USDT) {
      addToast(`Maximum bet is ${MAX_BET_AMOUNT_USDT} ${TOKEN_SYMBOL}.`, "error");
      return;
    }

    setSubmitting(true);
    let toastId;
    let activeIface = usdtContract.interface;

    try {
      const amountBaseUnits = wholeUsdtToBaseUnits(amountUsdt);

      setTxLabel(`Step 1 of 2 — Approve ${TOKEN_SYMBOL}`);
      toastId = addToast(`Step 1 of 2 — Approve ${TOKEN_SYMBOL}…`, "pending", 0);
      await ensureUsdtApproval({ readUsdtContract, usdtContract, owner: address, amountBaseUnits });
      removeToast(toastId);

      setTxLabel("Step 2 of 2 — Create bet");
      toastId = addToast("Step 2 of 2 — Create bet…", "pending", 0);
      activeIface = contract.interface;
      const tx = await contract.create(tableId, amountUsdt, slots, winnerId);
      const receipt = await waitForTx(tx);

      // Parse BetCreated event to get betId
      let betId = null;
      for (const log of receipt.logs) {
        try {
          const parsed = contract.interface.parseLog({ topics: log.topics, data: log.data });
          if (parsed && parsed.name === "BetCreated") {
            betId = Number(parsed.args.betId);
            break;
          }
        } catch {
          // Not our event, skip
        }
      }

      removeToast(toastId);
      addToast("Bet created!", "success");

      if (betId) {
        navigate(`/bet/${betId}`);
      }
    } catch (err) {
      if (toastId) removeToast(toastId);
      console.error("Create bet error:", err);
      const msg = parseContractError(err, activeIface);
      addToast(msg, "error");
    } finally {
      setSubmitting(false);
      setTxLabel("");
    }
  }

  return (
    <div className="create-bet-page">
      <WalletOverlay visible={submitting} label={txLabel} />
      <div className="create-bet-card">
        <h1 className="create-title">🎲 Create New Bet</h1>
        <p className="create-sub">Set up a wager on a Board Game Arena game.</p>

        {paused && (
          <div className="create-paused-banner">
            <span className="create-paused-icon">⏸️</span>
            <div className="create-paused-text">
              <strong>New bets are currently paused.</strong>
              <span>Existing bets are unaffected. Please check back later.</span>
            </div>
          </div>
        )}

        <form className="create-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="bgaTableId">BGA Table ID</label>
            <input
              id="bgaTableId"
              type="number"
              min="1"
              placeholder="e.g. 571836429"
              value={bgaTableId}
              onChange={(e) => setBgaTableId(e.target.value)}
              required
            />
            <span className="form-hint">
              Find this in the BGA game URL: boardgamearena.com/table?table=<strong>XXXXXXXXX</strong>
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="amount">Bet Amount Per Player ({TOKEN_SYMBOL})</label>
            <input
              id="amount"
              type="number"
              min={MIN_BET_AMOUNT_USDT}
              max={MAX_BET_AMOUNT_USDT}
              step="1"
              placeholder="e.g. 20"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <span className="form-hint">
              Whole {TOKEN_SYMBOL} only — min {MIN_BET_AMOUNT_USDT}, max {MAX_BET_AMOUNT_USDT}.
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="slotCount">Number of Players</label>
            <select
              id="slotCount"
              value={slotCount}
              onChange={(e) => setSlotCount(e.target.value)}
            >
              {[2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} players</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="predictedWinner">Your Predicted Winner (BGA Player ID)</label>
            <input
              id="predictedWinner"
              type="number"
              min="1"
              placeholder="e.g. 85123456"
              value={predictedWinner}
              onChange={(e) => setPredictedWinner(e.target.value)}
              required
            />
            <span className="form-hint">
              Click your avatar on BGA → <em>View my profile</em> → find the ID in the URL:
              boardgamearena.com/player?id=<strong>XXXXXXXXX</strong>
            </span>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg create-submit"
            disabled={submitting || !isConnected || paused}
          >
            {submitting
              ? txLabel.includes("Approve")
                ? `Approving ${TOKEN_SYMBOL}…`
                : "Creating…"
              : paused
                ? "New Bets Paused"
                : !isConnected
                  ? "Connect Wallet First"
                  : "Create Bet"}
          </button>
        </form>
      </div>
    </div>
  );
}
