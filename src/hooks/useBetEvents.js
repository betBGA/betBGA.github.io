import { useState, useEffect, useCallback, useRef } from "react";
import { zeroPadValue, toBeHex } from "ethers";
import { useWallet } from "./useWallet.js";
import { BETBGA_ADDRESS, DEPLOY_BLOCK, POLL_INTERVAL } from "../utils/constants.js";

/**
 * Fetch ALL contract events for a given betId in a single provider.getLogs() call.
 *
 * Every event has `betId` as the first indexed parameter (topic[1]).
 * We leave topic[0] (event signature) as null to match all event types,
 * then decode each log with the contract interface.
 */
export function useBetEvents(betId) {
  const { readContract, readProvider } = useWallet();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);

  const fetchEvents = useCallback(async () => {
    if (!readProvider || !readContract || !betId) return;

    try {
      const betIdHex = zeroPadValue(toBeHex(betId), 32);

      const logs = await readProvider.getLogs({
        address: BETBGA_ADDRESS,
        fromBlock: DEPLOY_BLOCK,
        topics: [null, betIdHex],
      });

      if (!mountedRef.current) return;

      const iface = readContract.interface;
      const parsed = [];

      for (const log of logs) {
        try {
          const decoded = iface.parseLog({ topics: log.topics, data: log.data });
          if (!decoded) continue;

          parsed.push({
            name: decoded.name,
            blockNumber: log.blockNumber,
            logIndex: log.index,
            transactionHash: log.transactionHash,
            timestamp: Number(decoded.args.timestamp),
            triggeredBy: decoded.args.triggeredBy ?? null,
            args: decoded.args,
          });
        } catch {
          // Skip logs that don't match our ABI (shouldn't happen)
        }
      }

      // Sort chronologically (block number, then log index within block)
      parsed.sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);

      if (mountedRef.current) {
        setEvents(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch bet events:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [readProvider, readContract, betId]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    setLoading(true);
    fetchEvents();
    return () => { mountedRef.current = false; };
  }, [fetchEvents]);

  // Poll for new events
  useEffect(() => {
    if (!betId || !readProvider) return;
    const interval = setInterval(fetchEvents, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchEvents, betId, readProvider]);

  return { events, loading, refetch: fetchEvents };
}

