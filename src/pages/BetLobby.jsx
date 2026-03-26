import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useBet } from "../hooks/useBet.js";
import { useWallet } from "../hooks/useWallet.js";
import { useToast } from "../hooks/useToast.js";
import { usePolName } from "../hooks/usePolName.js";
import { ParticipantSlot } from "../components/ParticipantSlot.jsx";
import { CopyLink } from "../components/CopyLink.jsx";
import { Confetti } from "../components/Confetti.jsx";
import { EventLog } from "../components/EventLog.jsx";
import { WalletOverlay } from "../components/WalletOverlay.jsx";
import { ConfirmDialog } from "../components/ConfirmDialog.jsx";
import { formatUsdc, bgaTableUrl, bgaPlayerUrl } from "../utils/format.js";
import { parseContractError, waitForTx } from "../utils/contract.js";
import { BetState, BET_STATE_NAMES, BETBGA_ADDRESS, ORACLE_FEE } from "../utils/constants.js";
import "./BetLobby.css";

export function BetLobby() {
  const { betId } = useParams();
  const { bet, loading, error, refetch } = useBet(Number(betId));
  const { contract, usdcContract, address, isConnected } = useWallet();
  const { addToast, removeToast } = useToast();

  const [predictedWinner, setPredictedWinner] = useState("");
  const [txPending, setTxPending] = useState(false);
  const [txLabel, setTxLabel] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Derived state
  const isParticipant = useMemo(
    () => bet?.participants.some((p) => p.addr.toLowerCase() === address?.toLowerCase()),
    [bet, address]
  );

  const myParticipant = useMemo(
    () => bet?.participants.find((p) => p.addr.toLowerCase() === address?.toLowerCase()),
    [bet, address]
  );

  const canRefund = useMemo(() => {
    if (!bet || bet.state !== BetState.Locked) return false;
    const now = Math.floor(Date.now() / 1000);
    return bet.lockedAt > 0 && now > bet.lockedAt + 86400;
  }, [bet]);

  // Detect duplicate predicted winners
  const duplicateWinnerIds = useMemo(() => {
    if (!bet || bet.participants.length < 2) return [];
    const counts = {};
    for (const p of bet.participants) {
      const id = String(p.predictedWinner);
      counts[id] = (counts[id] || 0) + 1;
    }
    return Object.entries(counts)
      .filter(([, count]) => count > 1)
      .map(([id]) => id);
  }, [bet]);

  // Resolve connected user's .pol name (used for PNS promo)
  const myPolName = usePolName(address);

  // Compute winner data for Resolved bets
  const { winnerFlags, payouts, isSplit, myWon } = useMemo(() => {
    if (!bet || bet.state !== BetState.Resolved) {
      return { winnerFlags: [], payouts: [], isSplit: false, myWon: false };
    }

    const ids = bet.resolvedWinnerIds || [];
    const flags = bet.participants.map((p) =>
      ids.some((id) => id === p.predictedWinner)
    );

    let winnerCount = flags.filter(Boolean).length;
    const split = winnerCount === 0;

    // If nobody predicted correctly, everyone wins (split)
    if (split) {
      winnerCount = bet.participants.length;
      flags.fill(true);
    }

    const pool = bet.amount * bet.slotCount - ORACLE_FEE;
    const share = Math.floor(pool / winnerCount);

    const payoutStrs = flags.map((won) => (won ? formatUsdc(share) : null));

    const myIdx = bet.participants.findIndex(
      (p) => p.addr.toLowerCase() === address?.toLowerCase()
    );
    const myIsWinner = myIdx >= 0 && flags[myIdx];

    return { winnerFlags: flags, payouts: payoutStrs, isSplit: split, myWon: myIsWinner };
  }, [bet, address]);

  async function execTx(label, fn) {
    if (!isConnected) {
      addToast("Please connect your wallet.", "error");
      return;
    }
    setTxLabel(label);
    setTxPending(true);
    let toastId = addToast(`${label}…`, "pending", 0);
    try {
      const tx = await fn();
      await waitForTx(tx);
      removeToast(toastId);
      addToast(`${label} successful!`, "success");
      refetch();
    } catch (err) {
      removeToast(toastId);
      console.error(`${label} error:`, err);
      const msg = parseContractError(err, contract?.interface);
      addToast(msg, "error");
    } finally {
      setTxPending(false);
      setTxLabel("");
    }
  }

  async function handleJoin(e) {
    e.preventDefault();
    const winnerId = parseInt(predictedWinner, 10);
    if (!winnerId || winnerId <= 0) {
      addToast("Enter a valid BGA player ID.", "error");
      return;
    }

    // Check & approve USDC
    try {
      const allowance = await usdcContract.allowance(address, BETBGA_ADDRESS);
      if (allowance < BigInt(bet.amount)) {
        setTxLabel("Approving USDC");
        setTxPending(true);
        const tid = addToast("Approving USDC…", "pending", 0);
        const appTx = await usdcContract.approve(BETBGA_ADDRESS, bet.amount);
        await waitForTx(appTx);
        removeToast(tid);
        addToast("USDC approved!", "success");
        setTxPending(false);
        setTxLabel("");
      }
    } catch (err) {
      console.error("Approve error:", err);
      addToast("USDC approval failed.", "error");
      setTxPending(false);
      setTxLabel("");
      return;
    }

    await execTx("Join bet", () => contract.join(bet.betId, winnerId));
    setPredictedWinner("");
  }

  function handleConfirm() {
    setShowConfirmDialog(true);
  }

  function handleConfirmConfirmed() {
    setShowConfirmDialog(false);
    execTx("Confirm bet", () => contract.confirm(bet.betId));
  }

  function handleLeave() {
    execTx("Leave bet", () => contract.leave(bet.betId));
  }

  function handleVoteCancel() {
    execTx("Vote to cancel", () => contract.voteCancel(bet.betId));
  }

  function handleRefund() {
    execTx("Request refund", () => contract.refund(bet.betId));
  }

  // Loading / Error states
  if (loading) {
    return (
      <div className="lobby-page">
        <div className="lobby-loading">
          <div className="loader" />
          <p>Loading bet #{betId}…</p>
        </div>
      </div>
    );
  }

  if (error || !bet) {
    return (
      <div className="lobby-page">
        <div className="lobby-error">
          <h2>😵 {error || "Bet not found"}</h2>
          <p>This bet may not exist or the contract is unreachable.</p>
        </div>
      </div>
    );
  }

  const stateName = BET_STATE_NAMES[bet.state];
  const stateClass = stateName.toLowerCase();
  const isFinal = bet.state >= BetState.Resolved;

  // Build slots array (filled + empty)
  const slots = [];
  for (let i = 0; i < bet.slotCount; i++) {
    slots.push(bet.participants[i] || null);
  }

  return (
    <div className={`lobby-page ${isFinal ? "lobby-final" : ""}`}>
      <WalletOverlay visible={txPending} label={txLabel} />
      <ConfirmDialog
        visible={showConfirmDialog}
        onConfirm={handleConfirmConfirmed}
        onCancel={() => setShowConfirmDialog(false)}
        bgaTableId={bet.bgaTableId}
        predictedWinner={myParticipant?.predictedWinner}
      />
      <Confetti active={bet.state === BetState.Resolved && myWon} />

      {/* Top bar */}
      <div className="lobby-header">
        <div className="lobby-header-left">
          <h1 className="lobby-title">Bet #{bet.betId}</h1>
          <span className={`bet-card-state state-${stateClass} lobby-state`}>
            {stateName}
          </span>
        </div>
        <div className="lobby-header-right">
          <CopyLink />
          <a
            href={bgaTableUrl(bet.bgaTableId)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline btn-sm"
          >
            🎲 BGA Table #{bet.bgaTableId}
          </a>
        </div>
      </div>

      {/* Two-column body: main content + event log */}
      <div className="lobby-body">
        <div className="lobby-main">
          {/* Bet info bar */}
          <div className="lobby-info-bar">
            <div className="info-item">
              <span className="info-label">
                Prize Pool
                <span className="oracle-fee-badge">
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 16a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm1.42-5.56c-.5.36-.42.7-.42 1.06h-2c0-.9.08-1.4.84-2 .62-.5 1.16-.86 1.16-1.5 0-.78-.56-1.25-1.25-1.25-.72 0-1.25.5-1.33 1.25H6.5C6.6 6.3 7.9 5 10 5c1.96 0 3.25 1.18 3.25 2.75 0 1.4-1.06 2.1-1.83 2.69z"/>
                  </svg>
                  <span className="oracle-fee-tooltip">
                    A $0.50 oracle fee is deducted from the total pool to cover game result verification.
                  </span>
                </span>
              </span>
              <span className="info-value amount">
                ${formatUsdc(bet.amount * bet.slotCount - ORACLE_FEE)}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Players</span>
              <span className="info-value">{bet.participants.length}/{bet.slotCount}</span>
            </div>
            {bet.state === BetState.Confirming && (
              <div className="info-item">
                <span className="info-label">Confirmed</span>
                <span className="info-value">{bet.confirmCount}/{bet.slotCount}</span>
              </div>
            )}
            {bet.state === BetState.Locked && (
              <div className="info-item">
                <span className="info-label">Cancel Votes</span>
                <span className="info-value">{bet.cancelVoteCount}/{bet.slotCount}</span>
              </div>
            )}
          </div>

          {/* Participants grid */}
          <div className="lobby-slots">
            {slots.map((p, i) => (
              <ParticipantSlot
                key={p ? p.addr : `empty-${i}`}
                participant={p}
                index={i}
                isWinner={bet.state === BetState.Resolved && !!winnerFlags[i]}
                isSplit={isSplit}
                payout={bet.state === BetState.Resolved ? payouts[i] : null}
                isYou={!!p && !!address && p.addr.toLowerCase() === address.toLowerCase()}
                betState={bet.state}
              />
            ))}
          </div>

          {/* PNS promo — shown to participants who don't have a .pol name */}
          {isParticipant && bet.state === BetState.Open && !myPolName && (
            <div className="pns-promo">
              <span className="pns-promo-icon">🏷️</span>
              <div className="pns-promo-text">
                <strong>Claim your .pol name</strong> — Replace your wallet address with a
                readable name like <em>yourname.pol</em>. Register one at{" "}
                <a
                  href="https://polygon.name/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Polygon Name Service
                </a>
                , then set a reverse record so dapps can display it.
              </div>
            </div>
          )}

          {/* Duplicate winner warning — shown during Confirming when players share a prediction */}
          {bet.state === BetState.Confirming && duplicateWinnerIds.length > 0 && (
            <div className="duplicate-warn">
              <span className="duplicate-warn-icon">⚠️</span>
              <div className="duplicate-warn-text">
                <strong>Shared prediction detected</strong> — Multiple participants are betting
                on the same winner:{" "}
                {duplicateWinnerIds.map((id, i) => (
                  <span key={id}>
                    {i > 0 && ", "}
                    <a
                      href={bgaPlayerUrl(id)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Player #{id}
                    </a>
                  </span>
                ))}
                . If that player wins, the prize pool will be split between them.
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="lobby-actions">
            {/* Open state: non-participants can join */}
            {bet.state === BetState.Open && !isParticipant && isConnected && (
              <form className="join-form" onSubmit={handleJoin}>
                <div className="join-form-row">
                  <input
                    type="number"
                    min="1"
                    placeholder="Your predicted winner ID"
                    value={predictedWinner}
                    onChange={(e) => setPredictedWinner(e.target.value)}
                    className="join-input"
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={txPending}>
                    {txPending ? "Joining…" : `Join — $${formatUsdc(bet.amount)}`}
                  </button>
                </div>
                <span className="form-hint">
                  Click your avatar on BGA → <em>View my profile</em> → find the ID in the URL:
                  boardgamearena.com/player?id=<strong>XXXXXXXXX</strong>
                </span>
              </form>
            )}

            {bet.state === BetState.Open && !isParticipant && !isConnected && (
              <p className="lobby-hint">Connect your wallet to join this bet.</p>
            )}

            {/* Open state: participants can leave */}
            {bet.state === BetState.Open && isParticipant && (
              <button className="btn btn-danger" onClick={handleLeave} disabled={txPending}>
                Leave Bet
              </button>
            )}

            {/* Confirming: participants can confirm or leave */}
            {bet.state === BetState.Confirming && isParticipant && (
              <div className="action-group">
                {!myParticipant?.confirmed && (
                  <button className="btn btn-primary" onClick={handleConfirm} disabled={txPending}>
                    Confirm Bet
                  </button>
                )}
                {myParticipant?.confirmed && (
                  <span className="lobby-hint">✓ You confirmed. Waiting for others…</span>
                )}
                <button className="btn btn-danger btn-sm" onClick={handleLeave} disabled={txPending}>
                  Leave
                </button>
              </div>
            )}

            {/* Locked: participants can vote cancel */}
            {bet.state === BetState.Locked && isParticipant && (
              <div className="action-group">
                {!myParticipant?.cancelVote && (
                  <button className="btn btn-danger" onClick={handleVoteCancel} disabled={txPending}>
                    🗳 Vote to Cancel
                  </button>
                )}
                {myParticipant?.cancelVote && (
                  <span className="lobby-hint">✓ You voted to cancel. Need all players to agree.</span>
                )}
                {canRefund && (
                  <button className="btn btn-outline" onClick={handleRefund} disabled={txPending}>
                    ⏰ Request Refund (24h passed)
                  </button>
                )}
                {!canRefund && (
                  <span className="lobby-hint time-hint">
                    ⏳ Game in progress. Refund available 24h after lock.
                  </span>
                )}
              </div>
            )}

            {/* Resolved */}
            {bet.state === BetState.Resolved && (
              <div className="resolved-banner">
                <h2>🏆 Bet Resolved!</h2>
                <p>The oracles have reported the result and winnings were distributed.</p>
              </div>
            )}

            {/* No Consensus */}
            {bet.state === BetState.NoConsensus && (
              <div className="cancelled-banner">
                <h2>⚖️ No Oracle Consensus</h2>
                <p>The oracles could not agree on a result. All stakes have been refunded in full.</p>
              </div>
            )}

            {/* Cancelled */}
            {bet.state === BetState.Cancelled && (
              <div className="cancelled-banner">
                <h2>❌ Bet Cancelled</h2>
                <p>All participants agreed to cancel. Stakes have been refunded.</p>
              </div>
            )}

            {/* Refunded */}
            {bet.state === BetState.Refunded && (
              <div className="refunded-banner">
                <h2>💸 Bet Refunded</h2>
                <p>No oracle consensus was reached within 24 hours. All stakes have been refunded.</p>
              </div>
            )}
          </div>
        </div>

        {/* Event log (chat panel) */}
        <EventLog betId={Number(betId)} />
      </div>
    </div>
  );
}

