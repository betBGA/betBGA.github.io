import { useEffect, useRef } from "react";
import { useBetEvents } from "../hooks/useBetEvents.js";
import { usePolName } from "../hooks/usePolName.js";
import { truncateAddress } from "../utils/format.js";
import { BLOCK_EXPLORER_URL } from "../utils/constants.js";
import "./EventLog.css";

const EXPLORER_URL = BLOCK_EXPLORER_URL;

/** Emoji + human-readable label for each event type */
const EVENT_META = {
  BetCreated:     { emoji: "🎲", label: "Bet Created" },
  BetJoined:      { emoji: "🤝", label: "Joined" },
  BetConfirming:  { emoji: "⏳", label: "Confirming" },
  BetLeft:        { emoji: "🚪", label: "Left" },
  BetReopened:    { emoji: "🔓", label: "Reopened" },
  BetConfirmed:   { emoji: "✅", label: "Confirmed" },
  BetLocked:      { emoji: "🔒", label: "Locked" },
  BetResolved:    { emoji: "🏆", label: "Resolved" },
  BetNoConsensus: { emoji: "⚖️", label: "No Consensus" },
  BetCancelVoted: { emoji: "🗳️", label: "Cancel Vote" },
  BetCancelled:   { emoji: "❌", label: "Cancelled" },
  BetRefunded:    { emoji: "💸", label: "Refunded" },
  OracleReported: { emoji: "🔮", label: "Oracle Report" },
};

/** Format a unix timestamp to a relative or absolute string */
function formatTime(unix) {
  const date = new Date(unix * 1000);
  const now = Date.now();
  const diffSec = Math.floor((now - date.getTime()) / 1000);

  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/** Build a short description of the event based on its args */
function getEventDetail(event) {
  const { name, args } = event;
  switch (name) {
    case "BetCreated":
      return `$${(Number(args.amount) / 1_000_000).toFixed(2)} · ${Number(args.slotCount)} slots · picks #${Number(args.predictedWinner)}`;
    case "BetJoined":
      return `picks player #${Number(args.predictedWinner)}`;
    case "BetResolved":
      return `winners: ${args.winners.map((id) => `#${Number(id)}`).join(", ")}`;
    case "OracleReported":
      return `reported: ${args.winnerIds.map((id) => `#${Number(id)}`).join(", ")}`;
    default:
      return null;
  }
}

/** Inline address component with .pol resolution */
function AddressLabel({ address }) {
  const polName = usePolName(address);
  const display = polName || truncateAddress(address);

  return (
    <a
      href={`${EXPLORER_URL}address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="evt-address"
      title={address}
    >
      {display}
    </a>
  );
}

function ChatMessage({ event }) {
  const meta = EVENT_META[event.name] || { emoji: "📋", label: event.name };
  const detail = getEventDetail(event);

  return (
    <div className="evt-message">
      <span className="evt-avatar">{meta.emoji}</span>
      <div className="evt-bubble">
        <div className="evt-bubble-header">
          {event.triggeredBy && <AddressLabel address={event.triggeredBy} />}
          <a
            href={`${EXPLORER_URL}tx/${event.transactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="evt-timestamp"
            title={new Date(event.timestamp * 1000).toLocaleString()}
          >
            {formatTime(event.timestamp)}
          </a>
        </div>
        <span className="evt-action">{meta.label}</span>
        {detail && <span className="evt-detail">{detail}</span>}
      </div>
    </div>
  );
}

export function EventLog({ betId }) {
  const { events, loading } = useBetEvents(betId);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new events arrive
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events]);

  return (
    <div className="evt-panel">
      <div className="evt-panel-header">
        <span className="evt-panel-title">📜 Event Log</span>
        <span className="evt-panel-count">{events?.length || 0}</span>
      </div>
      <div className="evt-panel-messages" ref={scrollRef}>
        {loading && (
          <p className="evt-panel-empty">Loading events…</p>
        )}
        {!loading && (!events || events.length === 0) && (
          <p className="evt-panel-empty">No events yet.</p>
        )}
        {!loading && events && events.map((evt) => (
          <ChatMessage key={`${evt.transactionHash}-${evt.logIndex}`} event={evt} />
        ))}
      </div>
    </div>
  );
}
