import React from "react";
import { Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard/Dashboard";
import Wallet from "./pages/Wallet/Wallet";
import MintToken from "./pages/MintToken/MintToken";
import TrackSupplyChain from "./pages/TrackSupplyChain/TrackSupplyChain";
import MyTokens from "./pages/MyTokens/MyTokens";
import Settings from "./pages/Settings/Settings";
import TransferHistory from "./pages/TransferHistory/TransferHistory";
import VerificationRequest from "./components/VerificationRequest";
import AdminDashboard from "./components/AdminDashboard";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/mint-token" element={<MintToken />} />
      <Route path="/track-supply-chain" element={<TrackSupplyChain />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/my-tokens" element={<MyTokens />} />
      <Route path="/transfer-history" element={<TransferHistory />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/verification-request" element={<VerificationRequest />} />
      <Route path="/admin-dashboard" element={<AdminDashboard />} />
    </Routes>
  );
};

export default AppRoutes;
