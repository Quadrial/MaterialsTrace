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
import { client } from "./client";
import { getContract } from "thirdweb";
import { sepolia } from "thirdweb/chains";

const contract = getContract({
  client,
  chain: sepolia,
  address: "0xaC659eE5a66B58DF9d72161a3324bb1E9b1001A3",
});

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard contract={contract} />} />
      <Route path="/mint-token" element={<MintToken contract={contract} />} />
      <Route path="/track-supply-chain" element={<TrackSupplyChain />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/my-tokens" element={<MyTokens />} />
      <Route path="/transfer-history" element={<TransferHistory />} />
      <Route path="/settings" element={<Settings />} />
      <Route
        path="/verification-request"
        element={<VerificationRequest contract={contract} />}
      />
      <Route
        path="/admin-dashboard"
        element={<AdminDashboard contract={contract} />}
      />
    </Routes>
  );
};

export default AppRoutes;
