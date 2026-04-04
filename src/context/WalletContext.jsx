import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { BrowserProvider, Contract } from "ethers";
import { BetBGAABI } from "../abi/BetBGA.js";
import { ERC20ABI } from "../abi/ERC20.js";
import {
  BETBGA_ADDRESS,
  POLYGON_CHAIN_ID,
  POLYGON_CHAIN_ID_HEX,
  USDT_ADDRESS,
} from "../utils/constants.js";
import { initEIP6963, getProviders, onProvidersChanged, getLegacyProvider } from "../utils/eip6963.js";
import { WalletCtx } from "./WalletCtx.js";
import { useRpc } from "../hooks/useRpc.js";


const LAST_WALLET_KEY = "bgamble:lastWallet";

export function WalletProvider({ children }) {
  const { readProvider, chainConfig } = useRpc();

  // Derive read-only contracts from the (reactive) readProvider
  const readContract = useMemo(
    () => new Contract(BETBGA_ADDRESS, BetBGAABI, readProvider),
    [readProvider]
  );
  const readUsdtContract = useMemo(
    () => new Contract(USDT_ADDRESS, ERC20ABI, readProvider),
    [readProvider]
  );

  const [wallets, setWallets] = useState([]);
  const [address, setAddress] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [usdtContract, setUsdtContract] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [autoConnecting, setAutoConnecting] = useState(
    () => !!localStorage.getItem(LAST_WALLET_KEY)
  );
  const [error, setError] = useState(null);
  const providerRef = useRef(null);
  const autoConnectAttempted = useRef(false);
  // connectRef lets the onProvidersChanged callback call connect() without
  // listing it as an effect dependency (which would re-run the effect).
  const connectRef = useRef(null);

  // Initialize EIP-6963 wallet discovery + auto-connect
  useEffect(() => {
    const storedRdns = localStorage.getItem(LAST_WALLET_KEY);

    // Subscribe BEFORE init so synchronous wallet announcements are caught
    const unsub = onProvidersChanged((providers) => {
      setWallets(providers);

      if (!storedRdns || autoConnectAttempted.current) return;

      const match = providers.find((w) => w.info.rdns === storedRdns);
      if (!match) return;

      autoConnectAttempted.current = true;

      // Silent check — eth_accounts never triggers a popup
      match.provider
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts && accounts.length > 0) {
            return connectRef.current?.(match);
          } else {
            localStorage.removeItem(LAST_WALLET_KEY);
          }
        })
        .catch(() => {
          localStorage.removeItem(LAST_WALLET_KEY);
        })
        .finally(() => {
          setAutoConnecting(false);
        });
    });

    initEIP6963();
    setWallets(getProviders());

    // If no matching wallet was announced synchronously, stop waiting
    if (!autoConnectAttempted.current) {
      setAutoConnecting(false);
    }

    return unsub;
  }, []);

  const switchToPolygon = useCallback(async (eipProvider) => {
    try {
      await eipProvider.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: POLYGON_CHAIN_ID_HEX }],
      });
    } catch (switchError) {
      // Chain not added — try adding it
      if (switchError.code === 4902) {
        await eipProvider.request({
          method: "wallet_addEthereumChain",
          params: [chainConfig],
        });
      } else {
        throw switchError;
      }
    }
  }, [chainConfig]);

  const clearState = useCallback(() => {
    setAddress(null);
    setSigner(null);
    setContract(null);
    setUsdtContract(null);
    setError(null);
  }, []);

  // Use a ref for event handlers to avoid circular deps
  const handleAccountsChanged = useCallback(
    (accounts) => {
      if (!accounts || accounts.length === 0) {
        providerRef.current = null;
        clearState();
      } else {
        setAddress(accounts[0]);
        if (providerRef.current) {
          const bp = new BrowserProvider(providerRef.current, POLYGON_CHAIN_ID);
          bp.getSigner().then((s) => {
            setSigner(s);
            setContract(new Contract(BETBGA_ADDRESS, BetBGAABI, s));
            setUsdtContract(new Contract(USDT_ADDRESS, ERC20ABI, s));
          });
        }
      }
    },
    [clearState]
  );

  const handleChainChanged = useCallback(() => {
    window.location.reload();
  }, []);

  const connect = useCallback(
    async (wallet) => {
      setConnecting(true);
      setError(null);
      try {
        // wallet is either an EIP-6963 entry { info, provider } or null for legacy
        const eipProvider = wallet ? wallet.provider : getLegacyProvider();
        if (!eipProvider) {
          throw new Error("No wallet found. Please install MetaMask or Rainbow.");
        }

        await switchToPolygon(eipProvider);

        const browserProvider = new BrowserProvider(eipProvider, POLYGON_CHAIN_ID);
        const newSigner = await browserProvider.getSigner();
        const addr = await newSigner.getAddress();

        providerRef.current = eipProvider;
        setAddress(addr);
        setSigner(newSigner);
        setContract(new Contract(BETBGA_ADDRESS, BetBGAABI, newSigner));
        setUsdtContract(new Contract(USDT_ADDRESS, ERC20ABI, newSigner));

        // Listen for account/chain changes
        eipProvider.on?.("accountsChanged", handleAccountsChanged);
        eipProvider.on?.("chainChanged", handleChainChanged);

        // Persist wallet choice for auto-connect on next visit
        if (wallet?.info?.rdns) {
          localStorage.setItem(LAST_WALLET_KEY, wallet.info.rdns);
        }
      } catch (err) {
        console.error("Wallet connect failed:", err);
        setError(err.message || "Failed to connect wallet");
      } finally {
        setConnecting(false);
      }
    },
    [switchToPolygon, handleAccountsChanged, handleChainChanged]
  );

  // Keep ref in sync so the onProvidersChanged callback can call connect()
  connectRef.current = connect;

  const disconnect = useCallback(() => {
    if (providerRef.current) {
      providerRef.current.removeListener?.("accountsChanged", handleAccountsChanged);
      providerRef.current.removeListener?.("chainChanged", handleChainChanged);
      providerRef.current = null;
    }
    localStorage.removeItem(LAST_WALLET_KEY);
    clearState();
  }, [handleAccountsChanged, handleChainChanged, clearState]);

  const value = {
    wallets,
    address,
    signer,
    contract,        // signer-attached contract (null if not connected)
    usdtContract,    // signer-attached USDT contract (null if not connected)
    readContract,    // read-only betBGA contract (always available)
    readUsdtContract,
    readProvider,    // read-only provider (always available)
    connecting,
    autoConnecting,
    error,
    connect,
    disconnect,
    isConnected: !!address,
  };

  return <WalletCtx.Provider value={value}>{children}</WalletCtx.Provider>;
}
