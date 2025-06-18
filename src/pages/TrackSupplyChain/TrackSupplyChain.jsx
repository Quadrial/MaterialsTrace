import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ethers } from "ethers";

// Placeholder contract ABI and address (replace with your deployed contract)
const contractAddress = "YOUR_CONTRACT_ADDRESS";
const contractABI = [
  "function getSupplyChainStages(uint256 tokenId) view returns (string[])",
];

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

// import React, { useState, useEffect } from "react";
// import { motion, useScroll, useTransform } from "framer-motion";
// import { ethers } from "ethers";
// import { useActiveAccount } from "thirdweb/react";
// import { client } from "../../client";
// import { sepolia } from "thirdweb/chains";

// // Contract details
// const contractAddress = "0xC2645158035D0573bbC9C4A679E9Bef922b764Da";
// const contractABI = [
//   "function getSupplyChainStages(uint256 tokenId) view returns (tuple(string description, uint256 timestamp)[])",
//   "function getLatestPrice() view returns (int256)",
// ];

// const TrackSupplyChain = () => {
//   const [stages, setStages] = useState([]);
//   const [price, setPrice] = useState(0);
//   const [metadata, setMetadata] = useState({});
//   const tokenId = 1; // Hardcoded for now; can be dynamic later
//   const account = useActiveAccount();

//   useEffect(() => {
//     const fetchData = async () => {
//       if (!account) return;

//       try {
//         const provider = new ethers.BrowserProvider(account.getProvider());
//         const signer = await provider.getSigner();
//         const contract = new ethers.Contract(contractAddress, contractABI, signer);

//         const fetchedStages = await contract.getSupplyChainStages(tokenId);
//         setStages(fetchedStages);

//         const fetchedPrice = await contract.getLatestPrice();
//         setPrice(fetchedPrice);

//         // Fetch metadata from MaterialsToken
//         const tokenContract = new ethers.Contract("0x6B89D3Da93924BA2d12D12071263C53041587f5E", [
//           "function uri(uint256 tokenId) view returns (string)",
//         ], signer);
//         const uriString = await tokenContract.uri(tokenId);
//         if (uriString) {
//           const response = await fetch(uriString);
//           const metadataJson = await response.json();
//           setMetadata(metadataJson);
//         }
//       } catch (error) {
//         console.error("Error fetching data:", error);
//       }
//     };
//     fetchData();
//   }, [account, tokenId]);

//   const { scrollYProgress } = useScroll();
//   const x = useTransform(scrollYProgress, [0, 1], [0, -200]);

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-64">
//       <motion.h1
//         className="text-3xl font-bold text-blue-400 mb-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         Track Supply Chain
//       </motion.h1>
//       <div className="mb-6">
//         <h2 className="text-xl font-semibold">Token #{tokenId} Details</h2>
//         {!account && <p className="text-red-400">Please connect your wallet to view details</p>}
//         {metadata.image && <img src={metadata.image.replace("https://ipfs.io/ipfs/", "https://ipfs.alchemyapi.io/ipfs/")} alt="Material" className="w-32 h-32 object-cover mb-2 rounded" />}
//         <p className="text-gray-400">Type: {metadata.type || "N/A"}, Weight: {metadata.weight || "N/A"}</p>
//         <p className="text-gray-400">Purity: {metadata.purity || "N/A"}, Origin: {metadata.origin || "N/A"}</p>
//         <p className="text-green-400 font-bold">Current Price: ${ethers.formatUnits(price, 8)}/unit</p>
//       </div>

//       <motion.div className="relative w-full overflow-x-auto" style={{ x }}>
//         <div className="flex space-x-4 p-2 bg-gray-800 rounded-lg min-h-[200px]">
//           {stages.map((stage, index) => (
//             <motion.div
//               key={index}
//               className="p-4 bg-gray-700 rounded-lg min-w-[150px] text-center"
//               initial={{ opacity: 0, y: 50 }}
//               animate={{ opacity: 1, y: 0 }}
//               transition={{ delay: index * 0.2 }}
//             >
//               <h3 className="text-lg font-semibold">{stage.description}</h3>
//               <p className="text-gray-400 text-sm">{new Date(stage.timestamp * 1000).toLocaleString()}</p>
//             </motion.div>
//           ))}
//         </div>
//       </motion.div>
//     </div>
//   );
// };

// export default TrackSupplyChain;
