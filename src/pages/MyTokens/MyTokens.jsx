import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { motion } from "framer-motion";

// Placeholder contract ABI and address (replace with your deployed contract)
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [
  "function balanceOf(address account, uint256 id) view returns (uint256)",
  "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
  "function uri(uint256 tokenId) view returns (string)", // For metadata/IPFS
];

const MyTokens = () => {
  const [tokens, setTokens] = useState([]);
  const [account, setAccount] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTokens = async () => {
      if (!window.ethereum) {
        alert("MetaMask not detected");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = signer.address;
        setAccount(address);

        const contract = new ethers.Contract(
          contractAddress,
          contractABI,
          provider
        );
        const tokenCount = await contract.balanceOf(address, 0); // Adjust token ID
        const tokenData = [];

        for (let i = 0; i < tokenCount; i++) {
          const tokenId = await contract.tokenOfOwnerByIndex(address, i);
          const uri = await contract.uri(tokenId); // Fetch metadata URI (e.g., IPFS)
          // Mock metadata parsing (replace with real IPFS fetch)
          const metadata = {
            id: tokenId.toString(),
            type: `Material ${i + 1}`,
            weight: `${(i + 1) * 500}kg`,
            purity: `${95 + i}%`,
            origin: ["Nigeria", "Ghana", "South Africa"][i % 3],
            image: `https://via.placeholder.com/200x200?text=Material${i + 1}`,
            price: 500 + i * 100,
          };
          tokenData.push(metadata);
        }
        setTokens(tokenData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchTokens();
  }, []);

  const handleTransfer = (tokenId) => {
    navigate(`/transfer-history?tokenId=${tokenId}`); // Placeholder for transfer flow
  };

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">My Tokens</h1>
      {tokens.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {tokens.map((token) => (
            <motion.div
              key={token.id}
              className="bg-gray-800 p-4 rounded-lg shadow-lg"
              whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
            >
              <img
                src={token.image}
                alt={`Token #${token.id}`}
                className="w-full h-48 object-cover rounded-t-lg mb-4"
              />
              <h3 className="text-xl font-semibold">Token #{token.id}</h3>
              <p className="text-gray-400">Type: {token.type}</p>
              <p className="text-gray-400">Weight: {token.weight}</p>
              <p className="text-gray-400">Purity: {token.purity}</p>
              <p className="text-gray-400">Origin: {token.origin}</p>
              <p className="text-green-400 font-bold mt-2">
                Price: ${token.price}/ton
              </p>
              <button
                onClick={() => handleTransfer(token.id)}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full"
              >
                Transfer
              </button>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-gray-400">No tokens owned. Mint some first!</p>
      )}
    </div>
  );
};

export default MyTokens;
