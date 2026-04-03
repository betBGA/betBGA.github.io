import { useContext } from "react";
import { RpcCtx } from "../context/RpcCtx.js";

export function useRpc() {
  const ctx = useContext(RpcCtx);
  if (!ctx) throw new Error("useRpc must be used within <RpcProvider>");
  return ctx;
}

