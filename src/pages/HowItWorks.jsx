import { Link } from "react-router-dom";
import { BETBGA_ADDRESS, BLOCK_EXPLORER_URL } from "../utils/constants.js";
import "./HowItWorks.css";

const CONTRACT_URL = `${BLOCK_EXPLORER_URL}/address/${BETBGA_ADDRESS}#code`;
const GITHUB_URL = "https://github.com/betBGA/contract";

export function HowItWorks() {
  return (
    <div className="hiw-page">
      <h1 className="hiw-title">⚙️ How It Works</h1>
      <p className="hiw-intro">
        BGAmble is an open-source, non-custodial smart contract on Polygon.
        All funds are held in escrow by the contract — never by a person — and
        winners are determined by independent oracle nodes.
      </p>

      {/* Bet Lifecycle */}
      <section className="hiw-section">
        <h2>Bet Lifecycle</h2>
        <p>Every bet moves through a simple state machine:</p>
        <div className="hiw-flow">
          <span className="hiw-state">Open</span>
          <span className="hiw-arrow">→</span>
          <span className="hiw-state">Confirming</span>
          <span className="hiw-arrow">→</span>
          <span className="hiw-state">Locked</span>
          <span className="hiw-arrow">→</span>
          <span className="hiw-state hiw-final">Resolved</span>
        </div>
        <ol className="hiw-list">
          <li>
            <strong>Open</strong> — A player creates a bet by specifying the BGA
            table&nbsp;ID, the POL stake, and the number of player slots
            (2–10). Other players join until all slots are filled.
          </li>
          <li>
            <strong>Confirming</strong> — Once full, every participant reviews
            the lobby (opponents &amp; predictions) and confirms. If anyone
            leaves, the bet re-opens and confirmations reset.
          </li>
          <li>
            <strong>Locked</strong> — All players confirmed. The game is played
            on Board Game Arena. Oracle nodes now monitor for the result.
          </li>
          <li>
            <strong>Resolved</strong> — Oracles reach consensus on the winner.
            The prize pool is distributed automatically to everyone who predicted
            correctly.
          </li>
        </ol>
      </section>

      {/* Oracle Consensus */}
      <section className="hiw-section">
        <h2>Oracle Consensus</h2>
        <p>
          Four independent oracle nodes watch Board Game Arena for game results.
          Each oracle submits a cryptographic hash of the winner(s) it observed.
          When <strong>3 out of 4</strong> oracles agree on the same hash, the
          result is accepted and the bet is resolved.
        </p>
        <ul className="hiw-list">
          <li>
            Oracles are set at deploy time and cannot be changed — there is no
            admin key.
          </li>
          <li>
            If all 4 oracles report but fewer than 3 agree, the bet enters
            a <strong>No&nbsp;Consensus</strong> state and all stakes are
            refunded in full.
          </li>
          <li>
            A fee of <strong>1% of the prize pool</strong> per resolved bet is
            deducted and paid to one oracle in round-robin
            order. No fee is charged when a bet is not successfully resolved.
          </li>
        </ul>
      </section>

      {/* Escrow & Payouts */}
      <section className="hiw-section">
        <h2>Escrow &amp; Payouts</h2>
        <p>
          Every participant's POL stake is sent to the contract when they
          join. Funds are held in escrow until the bet reaches a final state.
        </p>
        <ul className="hiw-list">
          <li>
            <strong>Winners predicted correctly</strong> — the prize pool (minus
            the 1% oracle fee) is split equally among all correct predictors.
          </li>
          <li>
            <strong>Nobody predicted correctly</strong> — the pool minus the fee
            is split equally among <em>all</em> participants.
          </li>
          <li>
            The maximum stake is <strong>10,000&nbsp;POL</strong> per
            participant, capping the financial incentive for oracle corruption.
          </li>
        </ul>
      </section>

      {/* Safety Mechanisms */}
      <section className="hiw-section">
        <h2>Safety Mechanisms</h2>
        <ul className="hiw-list">
          <li>
            <strong>Unanimous cancel</strong> — While a bet is locked, all
            participants can vote to cancel. If everyone agrees, all stakes are
            refunded with no fee.
          </li>
          <li>
            <strong>24-hour refund</strong> — If a locked bet is not resolved
            within 24&nbsp;hours, any participant can trigger a full refund.
          </li>
          <li>
            <strong>Reentrancy guard</strong> — All state-changing functions use
            OpenZeppelin's <code>ReentrancyGuard</code>.
          </li>
          <li>
            <strong>No admin keys</strong> — There is no owner, no upgrade
            mechanism, and no way to withdraw funds except through the normal bet
            lifecycle.
          </li>
        </ul>
      </section>

      {/* Source & Verification */}
      <section className="hiw-section">
        <h2>Source &amp; Verification</h2>
        <p>
          The contract is fully open-source and verified on-chain. You can
          inspect every line of code yourself:
        </p>
        <div className="hiw-links">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hiw-link-card"
          >
            <span className="hiw-link-icon">
              <svg width="22" height="22" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6C29.304 70.25 17.9 66.013 17.9 47.02c0-5.52 1.94-10.06 5.127-13.562-.485-1.302-2.265-6.436.486-13.4 0 0 4.204-1.384 13.77 5.134 3.992-1.14 8.267-1.707 12.52-1.707 4.254 0 8.529.566 12.52 1.707 9.567-6.518 13.77-5.134 13.77-5.134 2.751 6.964.97 12.098.485 13.4 3.268 3.502 5.127 8.042 5.127 13.562 0 19.073-11.486 23.23-22.413 24.45 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
              </svg>
            </span>
            <span>
              <strong>GitHub Repository</strong>
              <span className="hiw-link-sub">Smart contract &amp; oracle source code</span>
            </span>
          </a>
          <a
            href={CONTRACT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hiw-link-card"
          >
            <span className="hiw-link-icon">📜</span>
            <span>
              <strong>Verified Contract</strong>
              <span className="hiw-link-sub">View on Polygonscan</span>
            </span>
          </a>
        </div>
      </section>

      <div className="hiw-cta">
        <Link to="/create" className="btn btn-primary btn-lg">
          🎲 Create a Bet
        </Link>
        <Link to="/" className="btn btn-outline btn-lg">
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}

