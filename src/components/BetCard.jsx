import { Link } from "react-router-dom";
import { formatUsdt, computePayouts, bgaTableUrl } from "../utils/format.js";
import { BET_STATE_NAMES, ORACLE_FEE_USDT, TOKEN_SYMBOL } from "../utils/constants.js";
import "./BetCard.css";

export function BetCard({ bet }) {
  const stateName = BET_STATE_NAMES[bet.state] || "Unknown";
  const stateClass = stateName.toLowerCase();

  return (
    <Link to={`/bet/${bet.betId}`} className="bet-card">
      <div className="bet-card-header">
        <span className="bet-card-id">#{bet.betId}</span>
        <span className={`bet-card-state state-${stateClass}`}>{stateName}</span>
      </div>

      <div className="bet-card-body">
        <div className="bet-card-row">
          <span className="bet-card-label">Table</span>
          <span
            role="link"
            className="bet-card-table-link"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.open(bgaTableUrl(bet.bgaTableId), "_blank", "noopener,noreferrer");
            }}
          >
            #{bet.bgaTableId}
          </span>
        </div>
        <div className="bet-card-row">
          <span className="bet-card-label">
            Prize Pool
            <span className="oracle-fee-badge">
              <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 0a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 16a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm1.42-5.56c-.5.36-.42.7-.42 1.06h-2c0-.9.08-1.4.84-2 .62-.5 1.16-.86 1.16-1.5 0-.78-.56-1.25-1.25-1.25-.72 0-1.25.5-1.33 1.25H6.5C6.6 6.3 7.9 5 10 5c1.96 0 3.25 1.18 3.25 2.75 0 1.4-1.06 2.1-1.83 2.69z"/>
              </svg>
              <span className="oracle-fee-tooltip">
                A flat {formatUsdt(ORACLE_FEE_USDT)} {TOKEN_SYMBOL} oracle fee is deducted on resolved bets.
              </span>
            </span>
          </span>
          <span className="bet-card-amount">
            {formatUsdt(computePayouts(bet.amount, bet.slotCount, 1).payout)} {TOKEN_SYMBOL}
          </span>
        </div>
        <div className="bet-card-row">
          <span className="bet-card-label">Players</span>
          <span className="bet-card-players">
            {bet.participants.length}/{bet.slotCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

