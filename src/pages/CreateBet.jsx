import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWallet } from "../hooks/useWallet.js";
import { useToast } from "../hooks/useToast.js";
import { parseContractError, waitForTx } from "../utils/contract.js";
import { ONE_POL } from "../utils/constants.js";
import { WalletOverlay } from "../components/WalletOverlay.jsx";
import "./CreateBet.css";

export function CreateBet() {
  const { contract, readContract, isConnected } = useWallet();
  const { addToast, removeToast } = useToast();
  const navigate = useNavigate();

  const [bgaTableId, setBgaTableId] = useState("");
  const [amount, setAmount] = useState("");
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
    if (!isConnected || !contract) {
      addToast("Please connect your wallet first.", "error");
      return;
    }

    const tableId = parseInt(bgaTableId, 10);
    const slots = parseInt(slotCount, 10);
    const winnerId = parseInt(predictedWinner, 10);
    const amountPol = parseInt(amount, 10);

    if (!tableId || tableId <= 0) {
      addToast("Enter a valid BGA table ID.", "error");
      return;
    }
    if (!winnerId || winnerId <= 0) {
      addToast("Enter a valid BGA player ID for your predicted winner.", "error");
      return;
    }
    if (!amountPol || amountPol < 10) {
      addToast("Minimum bet is 10 POL.", "error");
      return;
    }
    if (amountPol > 10_000) {
      addToast("Maximum bet is 10,000 POL.", "error");
      return;
    }

    setSubmitting(true);
    let toastId;

    try {
      // Create bet — send native POL with the call
      setTxLabel("Creating bet");
      toastId = addToast("Creating bet…", "pending", 0);
      const value = BigInt(amountPol) * ONE_POL;
      const tx = await contract.create(tableId, amountPol, slots, winnerId, { value });
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
      const msg = parseContractError(err, contract?.interface);
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
            <label htmlFor="amount">Bet Amount (POL)</label>
            <input
              id="amount"
              type="number"
              min="10"
              max="10000"
              step="1"
              placeholder="e.g. 10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
            <span className="form-hint">Each player stakes this amount. Min 10 POL, max 10,000 POL.</span>
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
            {submitting ? "Creating…" : paused ? "New Bets Paused" : !isConnected ? "Connect Wallet First" : "Create Bet"}
          </button>
        </form>
      </div>
    </div>
  );
}
