import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  useActiveAccount,
  useSendTransaction,
  useReadContract,
} from "thirdweb/react";
import { getContract, prepareContractCall } from "thirdweb";
import { client } from "../client";
import { sepolia } from "thirdweb/chains";

const contractAddress = "0xccE8d10f1E5a7E902a68D4AB4Ad716817A8DA854";
const contractABI = [
  // ... (keep all your existing ABI entries)
  {
    type: "function",
    name: "getPendingRequestsCount",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "getPendingRequest",
    inputs: [{ name: "index", type: "uint256" }],
    outputs: [
      { name: "", type: "address" },
      { name: "", type: "string" },
    ],
    stateMutability: "view",
  },
];

const AdminDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");
  const account = useActiveAccount();
  const { mutateAsync: sendTransaction } = useSendTransaction();

  const contract = getContract({
    client,
    chain: sepolia,
    address: contractAddress,
    abi: contractABI,
  });

  // Check if connected account is admin
  const { data: adminAddress } = useReadContract({
    contract,
    method: "admin",
  });

  // Fetch all verification requests
  const fetchAllRequests = async () => {
    try {
      const count = await contract.call("getPendingRequestsCount");
      const pendingRequests = [];

      for (let i = 0; i < count; i++) {
        const [address, uri] = await contract.call("getPendingRequest", [i]);
        if (uri && uri.length > 0) {
          pendingRequests.push({
            address,
            uri,
            status: "Pending",
          });
        }
      }

      setRequests(pendingRequests);
    } catch (error) {
      console.error("Error fetching requests:", error);
      setMessage("Error loading requests: " + error.message);
    }
  };

  useEffect(() => {
    if (
      account &&
      adminAddress &&
      account.address.toLowerCase() === adminAddress.toLowerCase()
    ) {
      fetchAllRequests();

      // Set up polling to check for new requests every 15 seconds
      const interval = setInterval(fetchAllRequests, 15000);
      return () => clearInterval(interval);
    }
  }, [account, adminAddress]);

  const handleVerify = async (address) => {
    try {
      setMessage("Processing verification...");
      const tx = prepareContractCall({
        contract,
        method: "addVerifiedUser",
        params: [address],
      });
      await sendTransaction(tx);
      setMessage(`User ${address} verified successfully!`);
      // Refresh the list after verification
      await fetchAllRequests();
    } catch (error) {
      setMessage(`Error verifying user: ${error.message}`);
    }
  };

  if (!account) return <p>Please connect your wallet.</p>;
  if (
    adminAddress &&
    account.address.toLowerCase() !== adminAddress.toLowerCase()
  ) {
    return <p>Only admin can access this page.</p>;
  }

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml">
      {/* ... (keep your existing JSX structure) ... */}
      <div className="bg-gray-800 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Verification Requests</h2>
          <button
            onClick={fetchAllRequests}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Refresh
          </button>
        </div>

        {requests.length === 0 ? (
          <p>No pending requests.</p>
        ) : (
          <ul className="space-y-4">
            {requests.map((req) => (
              <li key={req.address} className="p-4 bg-gray-700 rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-semibold">Address:</p>
                    <p className="truncate">{req.address}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Details:</p>
                    <a
                      href={`https://gateway.ipfs.io/ipfs/${
                        req.uri.split("ipfs://")[1]
                      }`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline"
                    >
                      View Verification Data
                    </a>
                  </div>
                  <div className="flex items-center">
                    {req.status === "Pending" ? (
                      <button
                        onClick={() => handleVerify(req.address)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
                      >
                        Verify User
                      </button>
                    ) : (
                      <span className="text-green-400">✓ Verified</span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
