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
import MintingPage from "./pages/MintToken/MintingPage";
import Marketplace from "./components/Marketplace";

const contract = getContract({
  client,
  chain: sepolia,
  address: "0x7C8c61600679D11c6A47dFDab565c12a52df3968",
});


const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard contract={contract} />} />
      <Route path="/mint-token" element={<MintToken contract={contract} />} />
      <Route path="/mint-page" element={<MintingPage contract={contract} />} />
      <Route path="/marketplace" element={<Marketplace contract={contract} />} />
      <Route path="/track-supply-chain" element={<TrackSupplyChain />} />
      <Route path="/wallet" element={<Wallet />} />
      <Route path="/marketplace" element={<Marketplace />} />
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
