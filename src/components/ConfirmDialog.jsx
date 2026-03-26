import { useState, useRef } from "react";
import { bgaTableUrl, bgaPlayerUrl } from "../utils/format.js";
import "./ConfirmDialog.css";

export function ConfirmDialog({ visible, onConfirm, onCancel, bgaTableId, predictedWinner }) {
  const [checkTable, setCheckTable] = useState(false);
  const [checkWinner, setCheckWinner] = useState(false);
  const [checkStarted, setCheckStarted] = useState(false);
  const prevVisible = useRef(false);

  // Reset checkboxes when the dialog opens (false → true transition)
  if (visible && !prevVisible.current) {
    setCheckTable(false);
    setCheckWinner(false);
    setCheckStarted(false);
  }
  prevVisible.current = visible;

  if (!visible) return null;

  const allChecked = checkTable && checkWinner && checkStarted;

  return (
    <div className="confirm-dialog-overlay" onClick={onCancel}>
      <div className="confirm-dialog-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="confirm-dialog-title">Before you confirm</h2>
        <p className="confirm-dialog-subtitle">Please verify the following:</p>

        <label className="confirm-dialog-check">
          <input type="checkbox" checked={checkTable} onChange={() => setCheckTable(!checkTable)} />
          <span>
            The BGA{" "}
            <a href={bgaTableUrl(bgaTableId)} target="_blank" rel="noopener noreferrer">
              Table #{bgaTableId}
            </a>{" "}
            is the correct table
          </span>
        </label>

        <label className="confirm-dialog-check">
          <input type="checkbox" checked={checkWinner} onChange={() => setCheckWinner(!checkWinner)} />
          <span>
            My predicted winner{" "}
            <a href={bgaPlayerUrl(predictedWinner)} target="_blank" rel="noopener noreferrer">
              Player #{String(predictedWinner)}
            </a>{" "}
            is correct
          </span>
        </label>

        <label className="confirm-dialog-check">
          <input type="checkbox" checked={checkStarted} onChange={() => setCheckStarted(!checkStarted)} />
          <span>The game has been started on BGA</span>
        </label>

        <div className="confirm-dialog-actions">
          <button className="btn btn-outline" onClick={onCancel}>Cancel</button>
          <button className="btn btn-primary" disabled={!allChecked} onClick={onConfirm}>
            Confirm Bet
          </button>
        </div>
      </div>
    </div>
  );
}


