import { useState, useEffect, useCallback, useRef } from "react";
import { useWallet } from "./useWallet.js";
import { parseBetSummary } from "../utils/format.js";
import { POLL_INTERVAL } from "../utils/constants.js";

/**
 * Hook to fetch and poll a single bet by ID.
 * Returns { bet, loading, error, refetch }.
 */
export function useBet(betId) {
  const { readContract } = useWallet();
  const [bet, setBet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  const fetchBet = useCallback(async () => {
    if (!readContract || !betId) return;
    try {
      const raw = await readContract.getBetSummary(betId);
      if (!mountedRef.current) return;
      const parsed = parseBetSummary(raw);
      // betId 0 means non-existent
      if (parsed.betId === 0) {
        setError("Bet not found");
        setBet(null);
      } else {
        setBet(parsed);
        setError(null);
      }
    } catch (err) {
      if (!mountedRef.current) return;
      console.error("Failed to fetch bet:", err);
      setError("Failed to load bet");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [readContract, betId]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchBet();
    return () => { mountedRef.current = false; };
  }, [fetchBet]);

  // Poll for updates
  useEffect(() => {
    if (!betId || !readContract) return;
    const interval = setInterval(fetchBet, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchBet, betId, readContract]);

  return { bet, loading, error, refetch: fetchBet };
}

