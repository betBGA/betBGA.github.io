import { useState, useEffect, useRef } from "react";
import { useWallet } from "./useWallet.js";
import { parseBetSummary } from "../utils/format.js";

/**
 * Hook to fetch recent bets by state.
 * @param {number} state - BetState enum value
 * @param {number} limit - max results (default 5)
 */
export function useRecentBets(state, limit = 5) {
  const { readContract } = useWallet();
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);

    async function fetch() {
      if (!readContract) return;
      try {
        const raw = await readContract.getBetsByState(state, 0, limit, false);
        if (!mountedRef.current) return;
        const parsed = raw.map(parseBetSummary).filter((b) => b.betId !== 0);
        setBets(parsed);
      } catch (err) {
        console.error("Failed to fetch recent bets:", err);
        if (mountedRef.current) setBets([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }

    fetch();
    return () => { mountedRef.current = false; };
  }, [readContract, state, limit]);

  return { bets, loading };
}

