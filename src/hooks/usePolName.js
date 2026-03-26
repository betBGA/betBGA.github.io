import { useState, useEffect, useMemo } from "react";
import { Contract, JsonRpcProvider } from "ethers";
import { UD_PROXY_READER, getRpcUrls, POLYGON_CHAIN_ID } from "../utils/constants.js";

const UD_ABI = ["function reverseNameOf(address addr) view returns (string)"];

// Module-level cache: address → name (or "" for no name found)
const nameCache = new Map();

// Testnet mock names (UD/PNS contracts don't exist on Amoy)
const TESTNET_MOCK_NAMES = {
  "0xc5f9738c66b1881048bb84f28f32dd6b94a8a100": "mdej0ng.pol",
};

// Pre-populate cache with mocks when not on mainnet
if (POLYGON_CHAIN_ID !== 137) {
  for (const [addr, name] of Object.entries(TESTNET_MOCK_NAMES)) {
    nameCache.set(addr.toLowerCase(), name);
  }
}

// Shared provider for lookups — rebuilt if the active RPC URL changes
let udContract = null;
let udContractUrl = null;
function getUdContract() {
  const url = getRpcUrls()[0];
  if (!udContract || udContractUrl !== url) {
    const provider = new JsonRpcProvider(url, POLYGON_CHAIN_ID, { staticNetwork: true });
    udContract = new Contract(UD_PROXY_READER, UD_ABI, provider);
    udContractUrl = url;
  }
  return udContract;
}

/**
 * Hook to resolve a .pol domain name for a given address.
 * Returns the name or null if not found / still loading.
 */
export function usePolName(address) {
  const key = useMemo(() => address?.toLowerCase() ?? null, [address]);

  const [resolved, setResolved] = useState(() => {
    if (!key) return { key: null, name: null };
    const cached = nameCache.get(key);
    if (cached !== undefined) return { key, name: cached || null };
    return { key, name: null };
  });

  useEffect(() => {
    if (!key) return;

    const cached = nameCache.get(key);
    if (cached !== undefined) return;

    let cancelled = false;

    async function resolve() {
      try {
        const contract = getUdContract();
        const result = await contract.reverseNameOf(address);
        if (!cancelled) {
          nameCache.set(key, result || "");
          setResolved({ key, name: result || null });
        }
      } catch {
        if (!cancelled) {
          nameCache.set(key, "");
          setResolved({ key, name: null });
        }
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [key, address]);

  // If the address changed but we haven't resolved yet, check cache synchronously
  if (key !== resolved.key) {
    const cached = nameCache.get(key);
    if (cached !== undefined) return cached || null;
    return null;
  }

  return resolved.name;
}
