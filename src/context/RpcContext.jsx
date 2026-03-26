import { createContext, useContext, useState, useMemo, useCallback } from "react";
import { JsonRpcProvider } from "ethers";
import {
  POLYGON_CHAIN_ID,
  POLYGON_CHAIN_CONFIG,
  getRpcUrls,
  saveRpcUrls,
} from "../utils/constants.js";

const RpcCtx = createContext(null);

export function RpcProvider({ children }) {
  const [rpcUrls, setRpcUrlsState] = useState(getRpcUrls);

  const activeRpcUrl = rpcUrls[0];

  const readProvider = useMemo(
    () =>
      new JsonRpcProvider(activeRpcUrl, POLYGON_CHAIN_ID, {
        staticNetwork: true,
        batchMaxCount: 1,
      }),
    [activeRpcUrl]
  );

  /** Chain config with the full ordered RPC list for wallet_addEthereumChain */
  const chainConfig = useMemo(
    () => ({ ...POLYGON_CHAIN_CONFIG, rpcUrls }),
    [rpcUrls]
  );

  const setRpcUrls = useCallback((urls) => {
    saveRpcUrls(urls);
    setRpcUrlsState(urls);
  }, []);

  const value = useMemo(
    () => ({ rpcUrls, activeRpcUrl, readProvider, chainConfig, setRpcUrls }),
    [rpcUrls, activeRpcUrl, readProvider, chainConfig, setRpcUrls]
  );

  return <RpcCtx.Provider value={value}>{children}</RpcCtx.Provider>;
}

export function useRpc() {
  const ctx = useContext(RpcCtx);
  if (!ctx) throw new Error("useRpc must be used within <RpcProvider>");
  return ctx;
}

