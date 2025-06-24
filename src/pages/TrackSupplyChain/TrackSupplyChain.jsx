import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ethers } from "ethers";

// Placeholder contract ABI and address (replace with your deployed contract)


// Placeholder token ID and stages (replace with contract data)
const initialStages = ["Mined", "Processed", "Delivered"];
const tokenId = 123;

const TrackSupplyChain = () => {
  const [stages, setStages] = useState(initialStages);
  const [price, setPrice] = useState(500); // Placeholder for Chainlink Data Feed

  // Simulate fetching stages and price (replace with actual contract/integration)
  useEffect(() => {
    const fetchData = async () => {
      if (!window.ethereum) return;
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        contractAddress,
        contractABI,
        signer
      );
      // Mock contract call
      const fetchedStages = await contract.getSupplyChainStages(tokenId);
      setStages(fetchedStages);
    };
    fetchData();

    const interval = setInterval(() => {
      setPrice((prev) => prev + Math.floor(Math.random() * 10) - 5); // Mock price fluctuation
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 1], [0, -200]); // Horizontal scroll effect

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">
        Track Supply Chain
      </h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Token #{tokenId} Details</h2>
        <p className="text-gray-400">
          Type: Steel, Weight: 1000kg, Purity: 99.5%, Origin: Nigeria
        </p>
        <p className="text-green-400 font-bold">Current Price: ${price}/ton</p>
      </div>

      {/* Timeline */}
      <motion.div className="relative w-full overflow-x-auto" style={{ x }}>
        <div className="flex space-x-4 p-2 bg-gray-800 rounded-lg min-h-[200px]">
          {stages.map((stage, index) => (
            <motion.div
              key={index}
              className="p-4 bg-gray-700 rounded-lg min-w-[150px] text-center"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.2 }}
            >
              <h3 className="text-lg font-semibold">{stage}</h3>
              <p className="text-gray-400 text-sm">Day {index + 1}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default TrackSupplyChain;
