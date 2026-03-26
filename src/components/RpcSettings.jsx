import { useState, useRef, useEffect } from "react";
import { useRpc } from "../context/RpcContext.jsx";
import { DEFAULT_RPC_URLS, POLYGON_CHAIN_ID } from "../utils/constants.js";
import "./RpcSettings.css";

/**
 * Lightweight RPC health-check: sends eth_chainId and verifies the response
 * matches the expected chain. Resolves to true/false.
 */
async function validateRpcUrl(url) {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "eth_chainId", params: [] }),
      signal: AbortSignal.timeout(5000),
    });
    const json = await res.json();
    return parseInt(json.result, 16) === POLYGON_CHAIN_ID;
  } catch {
    return false;
  }
}

export function RpcSettings({ visible, onClose }) {
  const { rpcUrls, setRpcUrls } = useRpc();
  const [draft, setDraft] = useState(rpcUrls);
  const [newUrl, setNewUrl] = useState("");
  const [validating, setValidating] = useState(null); // index or "new"
  const [validationError, setValidationError] = useState(null);
  const inputRef = useRef(null);

  // Reset draft state whenever the dialog opens
  useEffect(() => {
    if (visible) {
      setDraft([...rpcUrls]);
      setNewUrl("");
      setValidating(null);
      setValidationError(null);
    }
  }, [visible, rpcUrls]);

  if (!visible) return null;

  const move = (index, direction) => {
    const next = [...draft];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setDraft(next);
  };

  const remove = (index) => {
    if (draft.length <= 1) return; // keep at least one
    setDraft(draft.filter((_, i) => i !== index));
  };

  const addUrl = async () => {
    const url = newUrl.trim();
    if (!url) return;
    if (draft.includes(url)) {
      setValidationError("This URL is already in the list.");
      return;
    }

    setValidating("new");
    setValidationError(null);
    const ok = await validateRpcUrl(url);
    setValidating(null);

    if (!ok) {
      setValidationError("Could not reach this RPC or chain ID mismatch.");
      return;
    }

    setDraft([...draft, url]);
    setNewUrl("");
    setValidationError(null);
  };

  const handleSave = () => {
    setRpcUrls(draft);
    onClose();
  };

  const handleReset = () => {
    setDraft([...DEFAULT_RPC_URLS]);
    setValidationError(null);
  };

  const hasChanges =
    draft.length !== rpcUrls.length ||
    draft.some((u, i) => u !== rpcUrls[i]);

  return (
    <div className="rpc-overlay" onClick={onClose}>
      <div className="rpc-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="rpc-title">RPC Servers</h2>
        <p className="rpc-subtitle">
          The first server is used for read calls. The full list is passed to
          your wallet in preferred order.
        </p>

        <ul className="rpc-list">
          {draft.map((url, i) => (
            <li key={url + i} className={`rpc-item${i === 0 ? " rpc-item--active" : ""}`}>
              <span className="rpc-url">{url}</span>
              <div className="rpc-item-actions">
                <button
                  className="rpc-btn"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  title="Move up"
                  aria-label="Move up"
                >▲</button>
                <button
                  className="rpc-btn"
                  onClick={() => move(i, 1)}
                  disabled={i === draft.length - 1}
                  title="Move down"
                  aria-label="Move down"
                >▼</button>
                <button
                  className="rpc-btn rpc-btn--danger"
                  onClick={() => remove(i)}
                  disabled={draft.length <= 1}
                  title="Remove"
                  aria-label="Remove"
                >✕</button>
              </div>
            </li>
          ))}
        </ul>

        {/* Add new URL */}
        <div className="rpc-add">
          <input
            ref={inputRef}
            type="url"
            className="rpc-input"
            placeholder="https://..."
            value={newUrl}
            onChange={(e) => { setNewUrl(e.target.value); setValidationError(null); }}
            onKeyDown={(e) => e.key === "Enter" && addUrl()}
          />
          <button
            className="btn btn-primary rpc-add-btn"
            onClick={addUrl}
            disabled={!newUrl.trim() || validating === "new"}
          >
            {validating === "new" ? "Checking…" : "Add"}
          </button>
        </div>
        {validationError && (
          <p className="rpc-error">{validationError}</p>
        )}

        {/* Actions */}
        <div className="rpc-actions">
          <button className="btn btn-ghost" onClick={handleReset}>
            Reset to defaults
          </button>
          <div className="rpc-actions-right">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={!hasChanges && draft.length > 0}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


