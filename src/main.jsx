import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { RpcProvider } from "./context/RpcContext.jsx";
import { WalletProvider } from "./context/WalletContext.jsx";
import { ToastProvider } from "./components/Toast.jsx";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <RpcProvider>
        <WalletProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </WalletProvider>
      </RpcProvider>
    </HashRouter>
  </StrictMode>
);

