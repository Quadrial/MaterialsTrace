import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlusCircle, FaRoad } from "react-icons/fa";
import { ethers } from "ethers";

// Placeholder token data with image URLs (replace with IPFS links or contract data later)
const initialTokens = [
  {
    id: 123,
    type: "Steel",
    weight: "1000kg",
    purity: "99.5%",
    origin: "Nigeria",
    price: 500,
    image: "images/steel.png", // Placeholder image
  },
  {
    id: 124,
    type: "Aluminum",
    weight: "800kg",
    purity: "98.7%",
    origin: "Ghana",
    price: 300,
    image: "images/al.png", // Placeholder image
  },
  {
    id: 125,
    type: "Copper",
    weight: "1200kg",
    purity: "99.9%",
    origin: "South Africa",
    price: 700,
    image: "images/cu.png", // Placeholder image
  },
];

const Dashboard = () => {
  const [tokens, setTokens] = useState(initialTokens);
  const [price, setPrice] = useState(500); // Placeholder for Chainlink Data Feed

  // Simulate fetching real-time price (replace with actual Chainlink integration)
  useEffect(() => {
    const interval = setInterval(() => {
      setPrice((prev) => prev + Math.floor(Math.random() * 10) - 5); // Mock price fluctuation
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 text-gray-200 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 md:top-0 top-10 sticky bg-gray-900 p-4 rounded-lg shadow-lg z-10">
        <h1 className="text-xl md:text-3xl font-bold text-blue-400">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <span className="hidden md:flex">Connected: 0x123...abc</span>{" "}
          {/* Replace with MetaMask address */}
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
            Connect Wallet
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-6">
        <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
          <FaPlusCircle /> Mint New Token
        </button>
        <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
          <FaRoad /> Track Supply Chain
        </button>
      </div>

      {/* Token Grid (NFT Marketplace Style with Images) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {tokens.map((token) => (
          <motion.div
            key={token.id}
            className="bg-gray-800 p-4 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
          >
            <img
              src={token.image}
              alt={`${token.type} Batch #${token.id}`}
              className="w-full h-48 object-cover rounded-t-lg mb-4"
            />
            <h3 className="text-xl font-semibold">
              {token.type} Batch #{token.id}
            </h3>
            <p className="text-gray-400">Weight: {token.weight}</p>
            <p className="text-gray-400">Purity: {token.purity}</p>
            <p className="text-gray-400">Origin: {token.origin}</p>
            <p className="text-green-400 font-bold mt-2">
              Price: ${token.price}/ton
            </p>
          </motion.div>
        ))}
      </div>

      {/* Timeline/Stats Section */}
      <div className="mt-6">
        <h2 className="text-2xl font-bold mb-4">Supply Chain Overview</h2>
        <motion.div
          className="flex overflow-x-auto space-x-4 p-2 bg-gray-800 rounded-lg"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-2 bg-gray-700 rounded text-white">Mined</div>
          <div className="p-2 bg-gray-700 rounded text-white">Processed</div>
          <div className="p-2 bg-gray-700 rounded text-white">Delivered</div>
        </motion.div>
        <p className="mt-2 text-gray-400">Current Steel Price: ${price}/ton</p>
      </div>
    </div>
  );
};

export default Dashboard;
