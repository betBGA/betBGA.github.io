import { Link } from "react-router-dom";
import { useRecentBets } from "../hooks/useRecentBets.js";
import { BetCard } from "../components/BetCard.jsx";
import { BetState } from "../utils/constants.js";
import "./Landing.css";

const STEPS = [
  { icon: "🎯", title: "Find Players", desc: "Find players that want to bet on a game." },
  { icon: "🎲", title: "Create a Lobby", desc: "Start a game on Board Game Arena and note the table ID from the URL." },
  { icon: "💰", title: "Create a Bet", desc: "Set the stake amount, number of players, and pick your winner." },
  { icon: "🔗", title: "Share the Link", desc: "Send the bet link to other players so they can join." },
  { icon: "✅", title: "Confirm & Play", desc: "Once all players joined, verify the details and confirm. Then play!" },
  { icon: "🏆", title: "Get Paid", desc: "Oracles report the result. Winners get paid automatically." },
];

export function Landing() {
  const { bets: resolvedBets, loading: loadingResolved } = useRecentBets(BetState.Resolved, 5);
  const { bets: lockedBets, loading: loadingLocked } = useRecentBets(BetState.Locked, 5);

  return (
    <div className="landing">
      {/* Hero */}
      <section className="hero">
        <div className="hero-glow" />
        <h1 className="hero-title">
          Bet on <span className="hero-highlight">Board Game Arena</span> games
        </h1>
        <p className="hero-sub">
          <a href="https://github.com/betBGA/betBGA.github.io" target="_blank" rel="noopener noreferrer" className="hero-link">Open-source</a> · Trust-minimized · Oracle-verified · USDC
        </p>
        <div className="hero-actions">
          <Link to="/create" className="btn btn-primary btn-lg">
            🎲 Create New Bet
          </Link>
          <Link to="/how-it-works" className="btn btn-outline btn-lg">
            ⚙️ How It Works
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="how-it-works">
        <h2 className="section-title">How to play?</h2>
        <div className="steps-grid">
          {STEPS.map((step, i) => (
            <div key={i} className="step-card">
              <div className="step-number">{i + 1}</div>
              <div className="step-icon">{step.icon}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-desc">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Bets */}
      <section className="recent-bets">
        <div className="recent-column">
          <h2 className="section-title">
            <span className="title-dot locked" />
            Live Games
          </h2>
          {loadingLocked ? (
            <div className="loading-placeholder">Loading…</div>
          ) : lockedBets.length === 0 ? (
            <div className="empty-state">No active games right now.</div>
          ) : (
            <div className="bets-list">
              {lockedBets.map((bet) => (
                <BetCard key={bet.betId} bet={bet} />
              ))}
            </div>
          )}
        </div>

        <div className="recent-column">
          <h2 className="section-title">
            <span className="title-dot resolved" />
            Recently Completed
          </h2>
          {loadingResolved ? (
            <div className="loading-placeholder">Loading…</div>
          ) : resolvedBets.length === 0 ? (
            <div className="empty-state">No completed bets yet.</div>
          ) : (
            <div className="bets-list">
              {resolvedBets.map((bet) => (
                <BetCard key={bet.betId} bet={bet} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta">
        <h2>Ready to play?</h2>
        <p>Create a bet and challenge your friends.</p>
        <div className="hero-actions">
          <Link to="/create" className="btn btn-primary btn-lg">
            🎲 Create New Bet
          </Link>
          <Link to="/faq" className="btn btn-outline btn-lg">
            📖 Read FAQ
          </Link>
        </div>
      </section>
    </div>
  );
}

