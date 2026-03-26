import "./WalletOverlay.css";

export function WalletOverlay({ visible, label }) {
  if (!visible) return null;

  return (
    <div className="wallet-overlay">
      <div className="wallet-overlay-card">
        <div className="wallet-overlay-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a1 1 0 0 0 0 4h3v-4z" />
          </svg>
        </div>
        <h2 className="wallet-overlay-title">Confirm in your wallet</h2>
        {label && <p className="wallet-overlay-label">{label}</p>}
        <div className="wallet-overlay-spinner" />
      </div>
    </div>
  );
}

