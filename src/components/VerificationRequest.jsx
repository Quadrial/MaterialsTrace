// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useActiveAccount, useConnect } from "thirdweb/react";
// import { client } from "../client";
// import { sepolia } from "thirdweb/chains";

// const VerificationRequest = () => {
//   const [formData, setFormData] = useState({
//     xPage: "",
//     website: "",
//     linkedin: "",
//     otherDetails: "",
//   });
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const account = useActiveAccount();
//   const { connect } = useConnect();

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!account) {
//       setMessage("Please connect your wallet first");
//       connect({ client, chain: sepolia });
//       return;
//     }

//     if (!formData.xPage && !formData.website && !formData.linkedin) {
//       setMessage("Please provide at least one verification link");
//       return;
//     }

//     try {
//       setIsLoading(true);
//       // Simulate sending to Thirdweb Storage or an API
//       const requestData = {
//         address: account.address,
//         ...formData,
//         timestamp: new Date().toISOString(),
//       };
//       const uri = await upload({
//         client,
//         files: [new Blob([JSON.stringify(requestData)], { type: "application/json" })],
//       });
//       setMessage("Verification request submitted! Await admin approval. URI: " + uri);
//       // In a real app, notify admin (e.g., via email or admin dashboard)
//     } catch (error) {
//       setMessage("Error submitting request: " + error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
//       <motion.h1
//         className="text-3xl font-bold text-blue-400 mb-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         Request Verification
//       </motion.h1>
//       {!account && (
//         <p className="text-red-400">Please connect your wallet to request verification.</p>
//       )}
//       {message && <p className={message.includes("Error") ? "text-red-400" : "text-green-400"}>{message}</p>}
//       <div className="bg-gray-800 p-4 rounded-lg space-y-4">
//         <form onSubmit={handleSubmit}>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5 }}
//           >
//             <label className="block text-gray-400 mb-1">X Page</label>
//             <input
//               type="text"
//               name="xPage"
//               value={formData.xPage}
//               onChange={handleChange}
//               placeholder="e.g., https://x.com/yourprofile"
//               className="w-full p-2 bg-gray-700 rounded"
//             />
//           </motion.div>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.1 }}
//           >
//             <label className="block text-gray-400 mb-1">Website</label>
//             <input
//               type="text"
//               name="website"
//               value={formData.website}
//               onChange={handleChange}
//               placeholder="e.g., https://yourwebsite.com"
//               className="w-full p-2 bg-gray-700 rounded"
//             />
//           </motion.div>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.2 }}
//           >
//             <label className="block text-gray-400 mb-1">LinkedIn</label>
//             <input
//               type="text"
//               name="linkedin"
//               value={formData.linkedin}
//               onChange={handleChange}
//               placeholder="e.g., https://linkedin.com/in/yourprofile"
//               className="w-full p-2 bg-gray-700 rounded"
//             />
//           </motion.div>
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.3 }}
//           >
//             <label className="block text-gray-400 mb-1">Other Details</label>
//             <textarea
//               name="otherDetails"
//               value={formData.otherDetails}
//               onChange={handleChange}
//               placeholder="e.g., company name, certifications"
//               className="w-full p-2 bg-gray-700 rounded h-24"
//             />
//           </motion.div>
//           <motion.button
//             type="submit"
//             disabled={isLoading}
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 0.5, delay: 0.4 }}
//             className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg w-full ${
//               isLoading ? "opacity-50 cursor-not-allowed" : ""
//             }`}
//           >
//             {isLoading ? "Submitting..." : "Request Verification"}
//           </motion.button>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default VerificationRequest;

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useActiveAccount,
  useConnect,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";
import { getContract, prepareContractCall } from "thirdweb";
import { upload } from "thirdweb/storage";

const contractAddress = "0xccE8d10f1E5a7E902a68D4AB4Ad716817A8DA854";
const contractAbi = [
  {
    type: "function",
    name: "requestVerification",
    inputs: [{ name: "detailsURI", type: "string" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "verificationRequests",
    inputs: [{ name: "user", type: "address" }],
    outputs: [{ name: "", type: "string" }],
    stateMutability: "view",
  },
];

const VerificationRequest = () => {
  const [formData, setFormData] = useState({
    xPage: "",
    website: "",
    linkedin: "",
    otherDetails: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const account = useActiveAccount();
  const { connect } = useConnect();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const contract = getContract({
    client,
    chain: sepolia,
    address: contractAddress,
    abi: contractAbi,
  });

  // Move useReadContract to the top level
  const {
    data: existingRequest,
    isLoading: isReadLoading,
    error: readError,
  } = useReadContract({
    contract,
    method: "verificationRequests",
    params: account ? [account.address] : undefined,
  });

  // Check if account is verify
  const { data: isVerified } = useReadContract({
    contract,
    method: "isVerified",
    params: account ? [account.address] : undefined,
  });

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous messages

    if (!account) {
      setMessage("Please connect your wallet first");
      connect({ client, chain: sepolia });
      return;
    }

    if (!formData.xPage && !formData.website && !formData.linkedin) {
      setMessage("Please provide at least one verification link");
      return;
    }

    try {
      setIsLoading(true);

      // Check if a request is already pending (using top-level useReadContract result)
      if (existingRequest && existingRequest.length > 0) {
        setMessage(
          "A verification request is already pending for your address."
        );
        return;
      }

      // Upload metadata to IPFS
      const requestData = {
        address: account.address,
        ...formData,
        timestamp: new Date().toISOString(),
      };
      const uri = await upload({
        client,
        files: [
          new Blob([JSON.stringify(requestData)], { type: "application/json" }),
        ],
      });

      // Call requestVerification on the contract
      const tx = await prepareContractCall({
        contract,
        method: "requestVerification",
        params: [uri],
      });
      await sendTransaction(tx);

      setMessage(
        "Verification request submitted! Await admin approval. URI: " + uri
      );
    } catch (error) {
      setMessage(
        "Error submitting request: " + (error.reason || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle read error
  useEffect(() => {
    if (readError) {
      setMessage("Error checking existing requests: " + readError.message);
    }
  }, [readError]);

  return (
    <>
      <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
        {isVerified && (
          <div className="bg-green-900 text-green-200 p-4 rounded-lg mb-4">
            Your account is already verified!
          </div>
        )}
        <motion.h1
          className="text-3xl font-bold text-blue-400 mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Request Verification
        </motion.h1>
        {!account && (
          <p className="text-red-400">
            Please connect your wallet to request verification.
          </p>
        )}
        {message && (
          <p
            className={
              message.includes("Error") ? "text-red-400" : "text-green-400"
            }
          >
            {message}
          </p>
        )}
        {isReadLoading && (
          <p className="text-yellow-400">Checking existing requests...</p>
        )}
        <div className="bg-gray-800 p-4 rounded-lg space-y-4">
          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <label className="block text-gray-400 mb-1">X Page</label>
              <input
                type="text"
                name="xPage"
                value={formData.xPage}
                onChange={handleChange}
                placeholder="e.g., https://x.com/yourprofile"
                className="w-full p-2 bg-gray-700 rounded"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <label className="block text-gray-400 mb-1">Website</label>
              <input
                type="text"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="e.g., https://yourwebsite.com"
                className="w-full p-2 bg-gray-700 rounded"
              />
            </motion.div>
            <motion.div>
              <label className="block text-gray-400 mb-1">LinkedIn</label>
              <input
                type="text"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="e.g., https://linkedin.com/in/yourprofile"
                className="w-full p-2 bg-gray-700 rounded"
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <label className="block text-gray-400 mb-1">Other Details</label>
              <textarea
                name="otherDetails"
                value={formData.otherDetails}
                onChange={handleChange}
                placeholder="e.g., company name, certifications"
                className="w-full p-2 bg-gray-700 rounded h-24"
              />
            </motion.div>
            <motion.button
              type="submit"
              disabled={isLoading || isReadLoading}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className={`bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg w-full ${
                isLoading || isReadLoading
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {isLoading
                ? "Submitting..."
                : isReadLoading
                ? "Checking..."
                : "Request Verification"}
            </motion.button>
          </form>
        </div>
      </div>
    </>
  );
};

export default VerificationRequest;
