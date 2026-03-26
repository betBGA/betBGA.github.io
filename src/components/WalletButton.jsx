import { useState, useRef, useEffect } from "react";
import { useWallet } from "../hooks/useWallet.js";
import { usePolName } from "../hooks/usePolName.js";
import { truncateAddress, roboHashUrl } from "../utils/format.js";
import { getLegacyProvider } from "../utils/eip6963.js";
import "./WalletButton.css";

/** Renders a .pol name with the TLD suffix dimmed */
function PolNameLabel({ name }) {
  const dotIndex = name.lastIndexOf(".");
  if (dotIndex === -1) return name;
  return (
    <>
      {name.slice(0, dotIndex)}
      <span className="pol-suffix">{name.slice(dotIndex)}</span>
    </>
  );
}

export function WalletButton() {
  const { wallets, address, connecting, autoConnecting, connect, disconnect, isConnected } = useWallet();
  const [open, setOpen] = useState(false);
  const polName = usePolName(address);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Don't render anything while auto-connect is in progress
  if (autoConnecting) return null;

  if (isConnected) {
    return (
      <div className="wallet-connected" ref={dropdownRef}>
        <button className="wallet-btn connected" onClick={() => setOpen(!open)}>
          <span className="wallet-dot" />
          {polName ? <PolNameLabel name={polName} /> : truncateAddress(address)}
        </button>
        <img
          src={roboHashUrl(address)}
          alt=""
          className="wallet-avatar"
        />
        {open && (
          <div className="wallet-dropdown">
            <div className="wallet-addr-full">{address}</div>
            {polName && <div className="wallet-pol-name"><PolNameLabel name={polName} /></div>}
            <button className="wallet-disconnect-btn" onClick={() => { disconnect(); setOpen(false); }}>
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  const hasWallets = wallets.length > 0;
  const hasLegacy = !!getLegacyProvider();

  return (
    <div className="wallet-connect" ref={dropdownRef}>
      <button
        className="wallet-btn"
        onClick={() => {
          // If only one option, connect directly
          if (wallets.length === 1 && !hasLegacy) {
            connect(wallets[0]);
          } else if (wallets.length === 0 && hasLegacy) {
            connect(null);
          } else {
            setOpen(!open);
          }
        }}
        disabled={connecting}
      >
        {connecting ? "Connecting…" : "Connect Wallet"}
      </button>
      {open && (
        <div className="wallet-dropdown">
          {wallets.map((w) => (
            <button
              key={w.info.rdns}
              className="wallet-option"
              onClick={() => { connect(w); setOpen(false); }}
            >
              {w.info.icon && (
                <img src={w.info.icon} alt="" className="wallet-icon" />
              )}
              {w.info.name}
            </button>
          ))}
          {!hasWallets && hasLegacy && (
            <button
              className="wallet-option"
              onClick={() => { connect(null); setOpen(false); }}
            >
              Browser Wallet
            </button>
          )}
          {!hasWallets && !hasLegacy && (
            <div className="wallet-no-wallets">
              No wallet detected.<br />
              Install <a href="https://metamask.io/" target="_blank" rel="noopener noreferrer">MetaMask</a> or{" "}
              <a href="https://rainbow.me/" target="_blank" rel="noopener noreferrer">Rainbow</a>.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
