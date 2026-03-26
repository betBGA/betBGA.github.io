import { usePolName } from "../hooks/usePolName.js";
import { truncateAddress, roboHashUrl, bgaPlayerUrl } from "../utils/format.js";
import { BetState } from "../utils/constants.js";
import "./ParticipantSlot.css";

/** Renders a .pol name with the TLD suffix dimmed */
function PolNameLabel({ name }) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return name;
  return (
    <>
      {name.slice(0, dotIndex)}&nbsp;
      <span className="pol-suffix">{name.slice(dotIndex)}</span>
    </>
  );
}

export function ParticipantSlot({ participant, index, isWinner, isSplit, payout, isYou, betState }) {
  if (!participant) {
    return (
      <div className="participant-slot empty">
        <div className="slot-avatar-placeholder">
          <span className="slot-number">{index + 1}</span>
        </div>
        <div className="slot-info">
          <span className="slot-waiting">Waiting for player…</span>
        </div>
      </div>
    );
  }

  const { addr, predictedWinner, confirmed, cancelVote } = participant;

  return (
    <ParticipantSlotInner
      addr={addr}
      predictedWinner={predictedWinner}
      confirmed={confirmed}
      cancelVote={cancelVote}
      isWinner={isWinner}
      isSplit={isSplit}
      payout={payout}
      isYou={isYou}
      betState={betState}
    />
  );
}

function ParticipantSlotInner({ addr, predictedWinner, confirmed, cancelVote, isWinner, isSplit, payout, isYou, betState }) {
  const polName = usePolName(addr);

  return (
    <div className={`participant-slot filled ${isWinner ? "winner" : ""} ${isYou ? "you" : ""}`}>
      <div className="slot-avatar-wrap">
        <img
          src={roboHashUrl(addr)}
          alt="avatar"
          className="slot-avatar"
          loading="lazy"
        />
        {isWinner && <div className="winner-glow" />}
      </div>
      <div className="slot-info">
        <span className="slot-name" title={addr}>
          {polName ? <PolNameLabel name={polName} /> : truncateAddress(addr)}
          {isYou && <span className="you-tag">You</span>}
        </span>
        <span className="slot-prediction">
          Picks BGA player:{" "}
          <a
            href={bgaPlayerUrl(predictedWinner)}
            target="_blank"
            rel="noopener noreferrer"
            className="player-link"
          >
            #{predictedWinner}
          </a>
        </span>
      </div>
      <div className="slot-badges">
        {betState === BetState.Confirming && confirmed && <span className="badge badge-confirmed">Confirmed</span>}
        {betState === BetState.Locked && cancelVote && <span className="badge badge-cancel">Voted to cancel</span>}
        {betState === BetState.Resolved && isWinner && (
          <span className={`badge ${isSplit ? "badge-split" : "badge-won"}`}>
            {isSplit ? "Split" : "Won"} ${payout}
          </span>
        )}
      </div>
    </div>
  );
}
