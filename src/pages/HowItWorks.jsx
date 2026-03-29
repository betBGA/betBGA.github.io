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

      {/* Contract banner */}
      <section className="hiw-contract-banner">
        <a
          href={CONTRACT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="hiw-contract-link"
        >
          <span className="hiw-contract-icon">📜</span>
          <span>
            <strong>View the verified contract on Polygonscan</strong>
            <code className="hiw-contract-address">{BETBGA_ADDRESS}</code>
          </span>
          <span className="hiw-external-arrow">↗</span>
        </a>
        <div className="hiw-tip">
          <span className="hiw-tip-icon">💡</span>
          <span>
            <strong>Tip:</strong> Add the contract address above to your
            wallet's address book (e.g. label it "BGAmble"). That way you can
            instantly recognize it when signing transactions.
          </span>
        </div>
      </section>

      {/* Bet Lifecycle */}
      <section className="hiw-section">
        <h2>Bet Lifecycle</h2>
        <p>
          Every bet moves through a series of states. Here's exactly what each
          state means.
        </p>

        {/* Flow diagram — happy path */}
        <div className="hiw-flow">
          <span className="hiw-state">Open</span>
          <span className="hiw-arrow">→</span>
          <span className="hiw-state">Confirming</span>
          <span className="hiw-arrow">→</span>
          <span className="hiw-state">Locked</span>
          <span className="hiw-arrow">→</span>
          <span className="hiw-state hiw-final">Resolved</span>
        </div>
        <div className="hiw-flow hiw-flow-branch">
          <span className="hiw-branch-label">from Locked:</span>
          <span className="hiw-state hiw-alt">No Consensus</span>
          <span className="hiw-state hiw-alt">Cancelled</span>
          <span className="hiw-state hiw-alt">Refunded</span>
        </div>

        <dl className="hiw-states">
          <div className="hiw-state-item">
            <dt>
              <span className="hiw-state-badge">Open</span>
            </dt>
            <dd>
              The bet has been created with a BGA table&nbsp;ID, a POL stake
              amount, and a number of player slots (2–10). The creator joins the bet automatically. Other players can join the bet.
              <span className="hiw-money hiw-money-out">
                🚪 You can <strong>leave</strong> at any time — your full stake
                is returned immediately.
              </span>
            </dd>
          </div>

          <div className="hiw-state-item">
            <dt>
              <span className="hiw-state-badge">Confirming</span>
            </dt>
            <dd>
              All slots are filled. Each player must now review the lobby —
              opponents, predictions, and the BGA table link — and confirm they
              are ready.
              <span className="hiw-money hiw-money-out">
                🚪 You can still <strong>leave</strong> — your full stake is
                returned. The bet re-opens and all other confirmations are
                reset.
              </span>
            </dd>
          </div>

          <div className="hiw-state-item">
            <dt>
              <span className="hiw-state-badge">Locked</span>
            </dt>
            <dd>
              Everyone confirmed. The game is played on Board Game Arena while
              oracle nodes monitor for the result. You cannot leave at this
              point.
              <span className="hiw-money hiw-money-neutral">
                🗳️ You can <strong>vote to cancel</strong>. If <em>all</em>{" "}
                participants vote to cancel, stakes are refunded in full with no fee.
              </span>
              <span className="hiw-money hiw-money-neutral">
                ⏱️ If no resolution arrives within <strong>24&nbsp;hours</strong>,
                any participant can trigger a full refund.
              </span>
            </dd>
          </div>

          <div className="hiw-state-item hiw-state-final">
            <dt>
              <span className="hiw-state-badge hiw-badge-final">Resolved</span>
            </dt>
            <dd>
              The oracles reached consensus on the game's winner(s). The prize
              pool (minus a 1% oracle fee) is automatically distributed:
              <ul className="hiw-payout-list">
                <li>
                  <strong>Correct predictors</strong> split the pool equally.
                </li>
                <li>
                  <strong>Nobody predicted correctly?</strong> The pool is split
                  equally among <em>all</em> participants.
                </li>
              </ul>
            </dd>
          </div>

          <div className="hiw-state-item hiw-state-final">
            <dt>
              <span className="hiw-state-badge hiw-badge-alt">No Consensus</span>
            </dt>
            <dd>
              All four oracles reported, but fewer than three agreed on the
              same result. All stakes are refunded in full —{" "}
              <strong>no fee</strong> is charged.
            </dd>
          </div>

          <div className="hiw-state-item hiw-state-final">
            <dt>
              <span className="hiw-state-badge hiw-badge-alt">Cancelled</span>
            </dt>
            <dd>
              Every participant voted to cancel the bet while it was locked.
              All stakes are refunded in full — <strong>no fee</strong> is
              charged.
            </dd>
          </div>

          <div className="hiw-state-item hiw-state-final">
            <dt>
              <span className="hiw-state-badge hiw-badge-alt">Refunded</span>
            </dt>
            <dd>
              The bet was locked for more than 24&nbsp;hours without being
              resolved, and a participant triggered the refund. All stakes are
              returned in full — <strong>no fee</strong> is charged.
            </dd>
          </div>
        </dl>
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
            Oracles are set at deploy time and <strong>cannot be changed</strong>.
            The contract has an owner, but the owner can <em>only</em> pause the
            creation of new bets — they cannot touch funds, change oracles, or
            interfere with existing bets in any way.
          </li>
          <li>
            If all 4 oracles report but fewer than 3 agree, the bet enters
            a <strong>No&nbsp;Consensus</strong> state and all stakes are
            refunded in full.
          </li>
        </ul>
      </section>

      {/* Oracle Fee */}
      <section className="hiw-section">
        <h2>Why the 1% Oracle Fee?</h2>
        <p>
          Running oracle nodes costs real money — servers that continuously
          monitor Board Game Arena, verify game results, and submit on-chain
          transactions (which cost gas). The <strong>1%&nbsp;fee</strong> on
          successfully resolved bets covers these infrastructure costs and
          incentivizes the oracles to operate reliably and honestly.
        </p>
        <ul className="hiw-list">
          <li>
            The fee is only charged when a bet is <strong>successfully
            resolved</strong>. No fee is taken on refunds, cancellations, or
            failed consensus.
          </li>
          <li>
            The fee is paid to one oracle at a time in round-robin order,
            spreading the reward evenly.
          </li>
          <li>
            The maximum stake is <strong>10,000&nbsp;POL</strong> per
            participant, capping the financial incentive for oracle corruption.
          </li>
        </ul>
      </section>

      {/* Source & Verification */}
      <section className="hiw-section">
        <h2>Source &amp; Verification</h2>
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

