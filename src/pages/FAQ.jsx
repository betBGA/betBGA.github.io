import { Link } from "react-router-dom";
import "./FAQ.css";

const FAQS = [
  {
    q: "What is betBGA?",
    a: "betBGA is a smart contract on Polygon that lets you bet on the outcome of Board Game Arena games. Players stake POL (Polygon's native token), play their game, and the winners get paid automatically based on oracle-reported results.",
  },
  {
    q: "How do I connect my wallet?",
    a: "Click the \"Connect Wallet\" button in the top-right corner. betBGA supports MetaMask and Rainbow Wallet. You'll need to be on the Polygon network — the app will prompt you to switch if needed.",
  },
  {
    q: "What is POL and how do I get it?",
    a: "POL is the native token of the Polygon network. You need POL both for gas fees and for staking in bets. You can buy POL on exchanges like Coinbase or Binance and transfer it to your Polygon wallet.",
  },
  {
    q: "How does betting work?",
    a: "1) Create a bet with a BGA table ID, stake amount, and your predicted winner. 2) Share the bet link with other players. 3) Once all slots are filled, everyone confirms. 4) Play the game on BGA. 5) Oracle nodes automatically detect the result and distribute winnings.",
  },
  {
    q: "What is the BGA Table ID?",
    a: "When you create or join a game on Board Game Arena, the URL contains a table ID like: boardgamearena.com/table?table=571836429. The number (571836429) is the table ID. Enter this when creating a bet.",
  },
  {
    q: "What is the BGA Player ID?",
    a: "Each player on Board Game Arena has a unique numeric ID. You can find it by viewing a player's profile — the ID is in the URL: boardgamearena.com/player?id=85123456. This ID is used to predict the winner.",
  },
  {
    q: "How are winners determined?",
    a: "Four independent oracle nodes monitor BGA for game results. When 3 out of 4 oracles report the same winner, the result is finalized and winnings are distributed automatically. If all 4 report without 3 agreeing, the bet enters a No Consensus state and all stakes are refunded in full — no oracle fee is charged.",
  },
  {
    q: "What if multiple people predict the same winner?",
    a: "Multiple participants can predict the same winner. If that player wins, all participants who predicted correctly share the prize pool equally.",
  },
  {
    q: "What is the oracle fee?",
    a: "A 1% fee is deducted from the prize pool to compensate the oracle nodes for their operational costs. For example, a 50 POL pool pays 0.5 POL in fees. This fee is paid in round-robin fashion across the four oracles.",
  },
  {
    q: "Can I cancel a bet?",
    a: "Yes, but only if ALL participants vote to cancel. Each participant must call \"Vote to Cancel\" while the bet is locked. If everyone agrees, all stakes are refunded with no oracle fee.",
  },
  {
    q: "What if the oracles don't report a result?",
    a: "If no oracle consensus is reached within 24 hours after the bet is locked, any participant can trigger a full refund. No oracle fee is charged in this case.",
  },
  {
    q: "What is the maximum bet amount?",
    a: "The maximum stake per participant is 10,000 POL. The minimum is 10 POL. These caps exist to limit the financial incentive for oracle corruption.",
  },
  {
    q: "Is it safe?",
    a: "betBGA is a non-custodial smart contract — funds are held in the contract, not by any person. The code is open-source and verifiable. However, as with any smart contract, use at your own risk. The 3-of-4 oracle consensus means you need to trust that at least 3 oracles are honest.",
  },
  {
    q: "What is Polygon?",
    a: "Polygon is a blockchain network with low transaction fees. betBGA is deployed on Polygon to keep gas costs minimal for players. POL (Polygon's native token) is used both for gas fees and as the betting currency.",
  }
];

export function FAQ() {
  return (
    <div className="faq-page">
      <h1 className="faq-title">❓ Frequently Asked Questions</h1>
      <p className="faq-intro">
        Everything you need to know about betBGA.
      </p>

      <div className="faq-list">
        {FAQS.map((faq, i) => (
          <details key={i} className="faq-item">
            <summary className="faq-question">{faq.q}</summary>
            <div className="faq-answer">
              {faq.a ? (
                <p>{faq.a}</p>
              ) : (
                <p>
                  No answer found.
                </p>
              )}
            </div>
          </details>
        ))}
      </div>

      <div className="faq-cta">
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

