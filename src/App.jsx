import { Routes, Route } from "react-router-dom";
import { Header } from "./components/Header.jsx";
import { Landing } from "./pages/Landing.jsx";
import { CreateBet } from "./pages/CreateBet.jsx";
import { BetLobby } from "./pages/BetLobby.jsx";
import { FAQ } from "./pages/FAQ.jsx";
import { HowItWorks } from "./pages/HowItWorks.jsx";
import "./App.css";

export default function App() {
  return (
    <>
      <Header />
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/create" element={<CreateBet />} />
          <Route path="/bet/:betId" element={<BetLobby />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "6rem 1.5rem" }}>
      <h1 style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>404</h1>
      <p style={{ color: "var(--text-muted)" }}>Page not found.</p>
    </div>
  );
}

