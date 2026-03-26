import { useContext } from "react";
import { WalletCtx } from "../context/WalletCtx.js";

export function useWallet() {
  const ctx = useContext(WalletCtx);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}

