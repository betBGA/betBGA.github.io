import { useState, useEffect, useCallback, useRef } from "react";
import { zeroPadValue, toBeHex } from "ethers";
import { useWallet } from "./useWallet.js";
import { BETBGA_ADDRESS, POLL_INTERVAL } from "../utils/constants.js";

// Free-tier RPCs cap getLogs at 10,000 blocks per request.
const MAX_BLOCK_RANGE = 9_999;

/**
 * Fetch logs in chunks of MAX_BLOCK_RANGE to stay within free-tier RPC limits.
 */
async function getLogsChunked(provider, filter, fromBlock, toBlock) {
  const allLogs = [];
  let start = fromBlock;
  while (start <= toBlock) {
    const end = Math.min(start + MAX_BLOCK_RANGE, toBlock);
    const logs = await provider.getLogs({ ...filter, fromBlock: start, toBlock: end });
    allLogs.push(...logs);
    start = end + 1;
  }
  return allLogs;
}

/**
 * Fetch ALL contract events for a given betId.
 *
 * Every event has `betId` as the first indexed parameter (topic[1]).
 * We leave topic[0] (event signature) as null to match all event types,
 * then decode each log with the contract interface.
 *
 * Uses the bet's createdAtBlock as the starting point so we only scan
 * the exact range where this bet's events can exist. Waits until
 * createdAtBlock is available before fetching.
 *
 * After the initial scan, subsequent polls only query from the last
 * seen block onward — typically a handful of blocks per 5-second interval.
 *
 * @param {number} betId
 * @param {number} [createdAtBlock] — block where the bet was created (from BetSummary)
 */
export function useBetEvents(betId, createdAtBlock) {
  const { readContract, readProvider } = useWallet();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  // Track the highest block we've fetched so polls only scan new blocks.
  const lastBlockRef = useRef(null);
  // Store createdAtBlock in a ref so the stable fetchEvents picks up the latest value
  // without being recreated (which would cascade into effect re-runs and duplicate fetches).
  const createdAtBlockRef = useRef(createdAtBlock);
  createdAtBlockRef.current = createdAtBlock;

  const fetchEvents = useCallback(async () => {
    if (!readProvider || !readContract || !betId || !createdAtBlockRef.current) return;

    try {
      const betIdHex = zeroPadValue(toBeHex(betId), 32);
      const latestBlock = await readProvider.getBlockNumber();

      const fromBlock = lastBlockRef.current != null
        ? lastBlockRef.current + 1
        : createdAtBlockRef.current;

      // Nothing new since last poll
      if (fromBlock > latestBlock) return;

      const filter = {
        address: BETBGA_ADDRESS,
        topics: [null, betIdHex],
      };

      const logs = await getLogsChunked(readProvider, filter, fromBlock, latestBlock);

      if (!mountedRef.current) return;

      lastBlockRef.current = latestBlock;

      const iface = readContract.interface;
      const newParsed = [];

      for (const log of logs) {
        try {
          const decoded = iface.parseLog({ topics: log.topics, data: log.data });
          if (!decoded) continue;

          newParsed.push({
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

      if (newParsed.length > 0 && mountedRef.current) {
        setEvents((prev) => {
          // Deduplicate by tx hash + log index to handle overlapping fetches
          const seen = new Set(prev.map((e) => `${e.transactionHash}-${e.logIndex}`));
          const unique = newParsed.filter((e) => !seen.has(`${e.transactionHash}-${e.logIndex}`));
          if (unique.length === 0) return prev;
          const merged = [...prev, ...unique];
          merged.sort((a, b) => a.blockNumber - b.blockNumber || a.logIndex - b.logIndex);
          return merged;
        });
      }
    } catch (err) {
      console.error("Failed to fetch bet events:", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [readProvider, readContract, betId]);

  // Reset when betId changes
  useEffect(() => {
    mountedRef.current = true;
    lastBlockRef.current = null;
    setEvents([]);
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
