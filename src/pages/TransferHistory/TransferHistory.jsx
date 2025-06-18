import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Correct import
import { ethers } from "ethers";

// Placeholder contract ABI and address (replace with your deployed contract)
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [
  "function getTransferHistory(uint256 tokenId) view returns (string[])",
  "function transferCrossChain(uint256 tokenId, address destination, uint64 destinationChainSelector) public",
];

// Mock data (replace with contract data)
const initialHistory = [
  { id: 1, tokenId: 123, fromChain: "Sepolia", toChain: "Fuji", date: "2025-06-08", status: "Completed" },
  { id: 2, tokenId: 124, fromChain: "Fuji", toChain: "Sepolia", date: "2025-06-07", status: "Pending" },
];

const TransferHistory = () => {
  const [searchParams] = useSearchParams(); // Destructure correctly
  const tokenIdParam = searchParams.get("tokenId") || 123; // Get tokenId from query string
  const [history, setHistory] = useState(initialHistory);
  const [transferData, setTransferData] = useState({ destination: "", chainSelector: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      if (!window.ethereum) return;
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractABI, signer);
        // Mock contract call
        const fetchedHistory = await contract.getTransferHistory(tokenIdParam);
        setHistory(fetchedHistory.map((h, i) => ({ id: i + 1, ...JSON.parse(h) })));
      } catch (error) {
        console.error(error);
      }
    };
    fetchHistory();
  }, [tokenIdParam]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setTransferData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (!window.ethereum) throw new Error("MetaMask not detected");
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractABI, signer);

      // Mock CCIP transfer (replace with real CCIP logic)
      const tx = await contract.transferCrossChain(
        tokenIdParam,
        transferData.destination,
        parseInt(transferData.chainSelector)
      );
      await tx.wait();
      setMessage("Transfer initiated successfully!");
      setHistory((prev) => [
        ...prev,
        {
          id: prev.length + 1,
          tokenId: tokenIdParam,
          fromChain: "Sepolia",
          toChain: "Fuji",
          date: new Date().toISOString().split("T")[0],
          status: "Pending",
        },
      ]);
    } catch (error) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">Transfer History - Token #{tokenIdParam}</h1>

      {/* Transfer Form */}
      <div className="bg-gray-800 p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Initiate Transfer</h2>
        <form onSubmit={handleTransfer} className="space-y-4">
          <div>
            <label className="block text-gray-400">Destination Address</label>
            <input
              type="text"
              name="destination"
              value={transferData.destination}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded mt-1"
              required
            />
          </div>
          <div>
            <label className="block text-gray-400">Chain Selector (e.g., 1 for Fuji)</label>
            <input
              type="text"
              name="chainSelector"
              value={transferData.chainSelector}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 rounded mt-1"
              required
            />
          </div>
          <button
            type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
            disabled={loading}
          >
            {loading ? "Transferring..." : "Transfer Token"}
          </button>
          {message && <p className="mt-2 text-green-400">{message}</p>}
        </form>
      </div>

      {/* Transfer History */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Transfer Log</h2>
        {history.length > 0 ? (
          <div className="space-y-4">
            {history.map((transfer) => (
              <div key={transfer.id} className="bg-gray-800 p-4 rounded-lg">
                <p>Token #{transfer.tokenId}</p>
                <p className="text-gray-400">From: {transfer.fromChain}</p>
                <p className="text-gray-400">To: {transfer.toChain}</p>
                <p className="text-gray-400">Date: {transfer.date}</p>
                <p className={`font-bold ${transfer.status === "Completed" ? "text-green-400" : "text-yellow-400"}`}>
                  Status: {transfer.status}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">No transfer history yet.</p>
        )}
      </div>
    </div>
  );
};

export default TransferHistory;