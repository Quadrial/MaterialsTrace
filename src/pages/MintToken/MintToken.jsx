// import React, { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { ethers } from "ethers";
// import { FaSpinner } from "react-icons/fa";

// // Placeholder contract ABI and address (replace with your deployed contract)
// const contractAddress = "YOUR_CONTRACT_ADDRESS";
// const contractABI = [
//   "function mintMaterial(address to, string memory metadata) public",
// ];

// const MintToken = () => {
//   const [formData, setFormData] = useState({
//     type: "",
//     weight: "",
//     purity: "",
//     origin: "",
//     image: null,
//   });
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: files ? files[0] : value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setMessage("");

//     try {
//       if (!window.ethereum) throw new Error("MetaMask not detected");

//       const provider = new ethers.BrowserProvider(window.ethereum);
//       await provider.send("eth_requestAccounts", []);
//       const signer = await provider.getSigner();
//       const contract = new ethers.Contract(
//         contractAddress,
//         contractABI,
//         signer
//       );

//       // Mock metadata (replace with IPFS hash for image)
//       const metadata = JSON.stringify({
//         type: formData.type,
//         weight: formData.weight,
//         purity: formData.purity,
//         origin: formData.origin,
//       });
//       const tx = await contract.mintMaterial(signer.address, metadata);
//       await tx.wait();
//       setMessage("Token minted successfully!");
//       setTimeout(() => navigate("/"), 2000); // Redirect to dashboard after 2s
//     } catch (error) {
//       setMessage(`Error: ${error.message}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-00 text-gray-200 min-h-screen md:ml-">
//       <h1 className="text-3xl font-bold text-blue-400 mb-6">Mint New Token</h1>
//       <form onSubmit={handleSubmit} className="max-w-lg space-y-4">
//         <div>
//           <label className="block text-gray-400">Material Type</label>
//           <input
//             type="text"
//             name="type"
//             value={formData.type}
//             onChange={handleChange}
//             className="w-full p-2 bg-gray-800 rounded mt-1"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-gray-400">Weight (kg)</label>
//           <input
//             type="text"
//             name="weight"
//             value={formData.weight}
//             onChange={handleChange}
//             className="w-full p-2 bg-gray-800 rounded mt-1"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-gray-400">Purity (%)</label>
//           <input
//             type="text"
//             name="purity"
//             value={formData.purity}
//             onChange={handleChange}
//             className="w-full p-2 bg-gray-800 rounded mt-1"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-gray-400">Origin</label>
//           <input
//             type="text"
//             name="origin"
//             value={formData.origin}
//             onChange={handleChange}
//             className="w-full p-2 bg-gray-800 rounded mt-1"
//             required
//           />
//         </div>
//         <div>
//           <label className="block text-gray-400">Image (optional)</label>
//           <input
//             type="file"
//             name="image"
//             onChange={handleChange}
//             className="w-full p-2 bg-gray-800 rounded mt-1"
//           />
//         </div>
//         <button
//           type="submit"
//           className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full md:w-auto"
//           disabled={loading}
//         >
//           {loading ? <FaSpinner className="animate-spin" /> : "Mint Token"}
//         </button>
//         {message && <p className="mt-2 text-green-400">{message}</p>}
//       </form>
//     </div>
//   );
// };

// export default MintToken;

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  useActiveAccount,
  useConnect,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { getContract } from "thirdweb";
import { prepareContractCall } from "thirdweb";
import { client } from "../../client";
import { sepolia } from "thirdweb/chains";
import MintingPage from "./MintingPage";

// Predefined materials with image URLs (store images in src/assets/materials/)
const materials = [
  { name: "Steel", image: "images/steel.png" },
  { name: "Aluminum", image: "images/al.png" },
  { name: "Copper", image: "images/cu.png" },
];

const contractAddress = "0x21Ff357810678F25e65C9b5fB608F5Ba38F24E90";
const contractABI = [
  {
    type: "function",
    name: "mintMaterial",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "metadata", type: "string" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "balanceOf",
    inputs: [
      { name: "account", type: "address" },
      { name: "id", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getLatestPrice",
    inputs: [],
    outputs: [{ name: "", type: "int256" }],
    stateMutability: "view",
  },
  {
    type: "error",
    name: "InvalidTokenId",
    inputs: [],
  },
  {
    type: "error",
    name: "OwnableUnauthorizedAccount",
    inputs: [{ name: "account", type: "address" }],
  },
  {
    type: "event",
    name: "TransferSingle",
    inputs: [
      { name: "operator", type: "address", indexed: true },
      { name: "from", type: "address", indexed: true },
      { name: "to", type: "address", indexed: true },
      { name: "id", type: "uint256", indexed: false },
      { name: "value", type: "uint256", indexed: false },
    ],
  },
];

const MintToken = () => {
  const [metadata, setMetadata] = useState({
    type: "",
    weight: "",
    purity: "",
    origin: "",
  });
  const [amount, setAmount] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0].name);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const account = useActiveAccount();
  const { connect } = useConnect();

  // Initialize Thirdweb v5 contract
  const contract = getContract({
    client,
    chain: sepolia,
    address: contractAddress,
    abi: contractABI,
  });

  // Read balance for a placeholder tokenId
  const {
    data: balance,
    isLoading: balanceLoading,
    error: balanceError,
  } = useReadContract({
    contract,
    method: "balanceOf",
    params: [account?.address, 1],
  });

  // Read Chainlink Price Feed
  const { data: price, isLoading: priceLoading } = useReadContract({
    contract,
    method: "getLatestPrice",
    params: [],
  });

  // Prepare transaction for minting
  const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setMetadata((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmountChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1) {
      setAmount(value);
    } else {
      setMessage("Amount must be at least 1");
    }
  };

  const handleMaterialChange = (e) => {
    setSelectedMaterial(e.target.value);
  };

  const handleMint = async () => {
    if (!account) {
      setMessage("Please connect your wallet first (use the deployer account)");
      connect({ client, chain: sepolia });
      return;
    }

    if (
      !selectedMaterial ||
      !metadata.type ||
      !metadata.weight ||
      !metadata.purity ||
      !metadata.origin
    ) {
      setMessage("Please fill in all metadata fields");
      return;
    }

    try {
      setIsLoading(true);
      // Get image URL for selected material
      const material = materials.find((m) => m.name === selectedMaterial);
      const fullMetadata = {
        ...metadata,
        image: material.image,
      };
      const metadataString = JSON.stringify(fullMetadata);

      // Prepare and send mint transaction
      const tx = prepareContractCall({
        contract,
        method: "mintMaterial",
        params: [account.address, amount, metadataString],
      });

      setMessage("Minting...");
      const receipt = await sendTransaction(tx);
      setMessage(`Minted successfully! TX: ${receipt.transactionHash}`);

      if (balance) {
        setMessage(`Minted successfully! Balance: ${balance.toString()}`);
      }
    } catch (error) {
      console.error("Mint Error Details:", error);
      if (error.message.includes("0x118cdaa7")) {
        setMessage(
          "Error: Invalid token ID. Check if tokenId is required or valid."
        );
      } else if (error.message.includes("OwnableUnauthorizedAccount")) {
        setMessage(
          "Error: Only the contract owner can mint. Use the deployer account."
        );
      } else {
        setMessage("Error minting: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml">
        <motion.h1
          className="text-3xl font-bold text-blue-400 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Mint Material Token
        </motion.h1>
        {balanceError && (
          <p className="text-red-400">Error: {balanceError.message}</p>
        )}
        {balance && !balanceLoading && (
          <p className="text-green-400">
            Current Balance: {balance.toString()}
          </p>
        )}
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
          {/* Material Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <label className="block text-gray-400 mb-1">Select Material</label>
            <select
              value={selectedMaterial}
              onChange={handleMaterialChange}
              className="w-full p-2 bg-gray-700 rounded"
            >
              {materials.map((material) => (
                <option key={material.name} value={material.name}>
                  {material.name}
                </option>
              ))}
            </select>
            <img
              src={materials.find((m) => m.name === selectedMaterial).image}
              alt={selectedMaterial}
              className="w-24 h-24 object-cover rounded mt-2"
            />
          </motion.div>

          {/* Metadata Inputs */}
          {["type", "weight", "purity", "origin"].map((field, index) => (
            <motion.div
              key={field}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <input
                type="text"
                name={field}
                placeholder={
                  field.charAt(0).toUpperCase() +
                  field.slice(1) +
                  (field === "weight"
                    ? " (e.g., 1000kg)"
                    : field === "purity"
                    ? " (e.g., 99.5%)"
                    : field === "origin"
                    ? " (e.g., Nigeria)"
                    : "")
                }
                value={metadata[field]}
                onChange={handleChange}
                className="w-full p-2 bg-gray-700 rounded"
              />
            </motion.div>
          ))}

          {/* Amount Input */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <input
              type="number"
              value={amount}
              onChange={handleAmountChange}
              min="1"
              className="w-full p-2 bg-gray-700 rounded"
              placeholder="Amount"
            />
          </motion.div>

          {/* Chainlink Price Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <p className="text-gray-400">
              {priceLoading
                ? "Loading..."
                : `Current ${selectedMaterial} Price: $${(price / 1e8).toFixed(
                    2
                  )}/ton`}
            </p>
          </motion.div>

          {/* Mint Button */}
          <motion.button
            onClick={handleMint}
            disabled={isLoading || isPending}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg w-full ${
              isLoading || isPending ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isLoading || isPending ? "Processing..." : "Mint Token"}
          </motion.button>

          {/* Message */}
          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`mt-2 ${
                message.includes("Error") ? "text-red-400" : "text-green-400"
              }`}
            >
              {message}
            </motion.p>
          )}
        </div>
      </div>
      
    </>
  );
};

export default MintToken;
