import { useState } from "react";
import { Link } from "react-router-dom";
import { WalletButton } from "./WalletButton.jsx";
import { RpcSettings } from "./RpcSettings.jsx";
import "./Header.css";

export function Header() {
  const [rpcOpen, setRpcOpen] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-logo">
            <span className="logo-bet">bet</span>
            <span className="logo-bga">BGA</span>
          </Link>

          <nav className="header-nav">
            <Link to="/" className="nav-link nav-home">Home</Link>
            <Link to="/faq" className="nav-link">FAQ</Link>
            <a
              href="https://github.com/betBGA/betBGA.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="nav-link github-link"
              title="View on GitHub"
            >
              <svg width="20" height="20" viewBox="0 0 98 96" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.934-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6C29.304 70.25 17.9 66.013 17.9 47.02c0-5.52 1.94-10.06 5.127-13.562-.485-1.302-2.265-6.436.486-13.4 0 0 4.204-1.384 13.77 5.134 3.992-1.14 8.267-1.707 12.52-1.707 4.254 0 8.529.566 12.52 1.707 9.567-6.518 13.77-5.134 13.77-5.134 2.751 6.964.97 12.098.485 13.4 3.268 3.502 5.127 8.042 5.127 13.562 0 19.073-11.486 23.23-22.413 24.45 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.788 0 48.854 0z" fill="currentColor"/>
              </svg>
              <span className="nav-label">GitHub</span>
            </a>
          </nav>

          <div className="header-right">
            <button
              className="settings-btn"
              onClick={() => setRpcOpen(true)}
              title="RPC Settings"
              aria-label="RPC Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
            <WalletButton />
          </div>
        </div>
      </header>

      <RpcSettings visible={rpcOpen} onClose={() => setRpcOpen(false)} />
    </>
  );
}
