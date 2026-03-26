/**
 * EIP-6963 multi-wallet provider discovery.
 * Listens for wallet announcements and collects them.
 */

const providers = [];
const listeners = new Set();

function handleAnnounce(event) {
  const { info, provider } = event.detail;
  // Avoid duplicates by rdns
  if (providers.some((p) => p.info.rdns === info.rdns)) return;
  providers.push({ info, provider });
  listeners.forEach((fn) => fn([...providers]));
}

let initialized = false;

export function initEIP6963() {
  if (initialized) return;
  initialized = true;
  window.addEventListener("eip6963:announceProvider", handleAnnounce);
  window.dispatchEvent(new Event("eip6963:requestProvider"));
}

export function getProviders() {
  return [...providers];
}

export function onProvidersChanged(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/**
 * Check if any EIP-6963 wallets were detected.
 * Falls back to window.ethereum (legacy MetaMask injection).
 */
export function getLegacyProvider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return window.ethereum;
  }
  return null;
}

