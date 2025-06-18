import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { FaWallet, FaSignOutAlt } from "react-icons/fa";

// Placeholder contract ABI and address (replace with your deployed contract)
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
];

const Wallet = () => {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState("0 ETH");
  const [tokens, setTokens] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const connectWallet = async () => {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = signer.address;
        setAccount(address.substring(0, 6) + "..." + address.substring(address.length - 4));

        // Fetch ETH balance
        const ethBalance = await provider.getBalance(address);
        setBalance(ethers.formatEther(ethBalance));

        // Fetch owned tokens (mock for now)
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const tokenCount = await contract.balanceOf(address, 0); // Adjust token ID
        const tokenIds = [];
        for (let i = 0; i < tokenCount; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          tokenIds.push(tokenId.toString());
        }
        setTokens(tokenIds);
      } catch (error) {
        console.error(error);
      }
    };

    connectWallet();
  }, []);

  const disconnectWallet = () => {
    setAccount(null);
    setBalance("0 ETH");
    setTokens([]);
    // Note: MetaMask handles disconnection; this resets UI state
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">Wallet</h1>
      {account ? (
        <div className="space-y-6">
          <div className="bg-gray-800 p-4 rounded-lg">
            <p className="text-gray-400">Address: {account}</p>
            <p className="text-green-400 font-bold">Balance: {balance}</p>
            <button
              onClick={disconnectWallet}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 mt-4 rounded"
            >
              <FaSignOutAlt /> Disconnect
            </button>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Owned Tokens</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {tokens.map((tokenId) => (
                <div key={tokenId} className="bg-gray-800 p-4 rounded-lg text-center">
                  <p>Token #{tokenId}</p>
                  <button
                    onClick={() => navigate("/my-tokens")}
                    className="mt-2 text-blue-400 hover:underline"
                  >
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => window.ethereum.request({ method: "eth_requestAccounts" })}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Connect Wallet
        </button>
      )}
    </div>
  );
};

export default Wallet;