// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   useActiveAccount,
//   useSendTransaction,
//   useReadContract,
// } from "thirdweb/react";
// import { getContract, prepareContractCall } from "thirdweb";
// import { client } from "../client";
// import { sepolia } from "thirdweb/chains";

// const contractAddress = "0xccE8d10f1E5a7E902a68D4AB4Ad716817A8DA854";
// const contractABI = [
//   // ... (keep all your existing ABI entries)
//   {
//     type: "function",
//     name: "getPendingRequestsCount",
//     inputs: [],
//     outputs: [{ name: "", type: "uint256" }],
//     stateMutability: "view",
//   },
//   {
//     type: "function",
//     name: "getPendingRequest",
//     inputs: [{ name: "index", type: "uint256" }],
//     outputs: [
//       { name: "", type: "address" },
//       { name: "", type: "string" },
//     ],
//     stateMutability: "view",
//   },
// ];

// const AdminDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [message, setMessage] = useState("");
//   const account = useActiveAccount();
//   const { mutateAsync: sendTransaction } = useSendTransaction();

//   const contract = getContract({
//     client,
//     chain: sepolia,
//     address: contractAddress,
//     abi: contractABI,
//   });

//   // Check if connected account is admin
//   const { data: adminAddress } = useReadContract({
//     contract,
//     method: "admin",
//   });

//   // Fetch all verification requests
//   const fetchAllRequests = async () => {
//     try {
//       const count = await contract.call("getPendingRequestsCount");
//       const pendingRequests = [];

//       for (let i = 0; i < count; i++) {
//         const [address, uri] = await contract.call("getPendingRequest", [i]);
//         if (uri && uri.length > 0) {
//           pendingRequests.push({
//             address,
//             uri,
//             status: "Pending",
//           });
//         }
//       }

//       setRequests(pendingRequests);
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//       setMessage("Error loading requests: " + error.message);
//     }
//   };

//   useEffect(() => {
//     if (
//       account &&
//       adminAddress &&
//       account.address.toLowerCase() === adminAddress.toLowerCase()
//     ) {
//       fetchAllRequests();

//       // Set up polling to check for new requests every 15 seconds
//       const interval = setInterval(fetchAllRequests, 15000);
//       return () => clearInterval(interval);
//     }
//   }, [account, adminAddress]);

//   const handleVerify = async (address) => {
//     try {
//       setMessage("Processing verification...");
//       const tx = prepareContractCall({
//         contract,
//         method: "addVerifiedUser",
//         params: [address],
//       });
//       await sendTransaction(tx);
//       setMessage(`User ${address} verified successfully!`);
//       // Refresh the list after verification
//       await fetchAllRequests();
//     } catch (error) {
//       setMessage(`Error verifying user: ${error.message}`);
//     }
//   };

//   if (!account) return <p>Please connect your wallet.</p>;
//   if (
//     adminAddress &&
//     account.address.toLowerCase() !== adminAddress.toLowerCase()
//   ) {
//     return <p>Only admin can access this page.</p>;
//   }

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml">
//       {/* ... (keep your existing JSX structure) ... */}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Verification Requests</h2>
//           <button
//             onClick={fetchAllRequests}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           >
//             Refresh
//           </button>
//         </div>

//         {requests.length === 0 ? (
//           <p>No pending requests.</p>
//         ) : (
//           <ul className="space-y-4">
//             {requests.map((req) => (
//               <li key={req.address} className="p-4 bg-gray-700 rounded-lg">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <p className="font-semibold">Address:</p>
//                     <p className="truncate">{req.address}</p>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Details:</p>
//                     <a
//                       href={`https://gateway.ipfs.io/ipfs/${
//                         req.uri.split("ipfs://")[1]
//                       }`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-400 hover:underline"
//                     >
//                       View Verification Data
//                     </a>
//                   </div>
//                   <div className="flex items-center">
//                     {req.status === "Pending" ? (
//                       <button
//                         onClick={() => handleVerify(req.address)}
//                         className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//                       >
//                         Verify User
//                       </button>
//                     ) : (
//                       <span className="text-green-400">✓ Verified</span>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// import React, { useState, useEffect } from "react";
// import { motion } from "framer-motion";
// import {
//   useActiveAccount,
//   useSendTransaction,
//   useReadContract,
// } from "thirdweb/react";
// import { getContract, prepareContractCall } from "thirdweb";
// import { client } from "../client";
// import { sepolia } from "thirdweb/chains";
// import contractJson from "../abi/MaterialsMarket.json"; // Adjust path

// const contractAddress = "0xccE8d10f1E5a7E902a68D4AB4Ad716817A8DA854";
// const contractABI = contractJson.abi;

// const AdminDashboard = () => {
//   const [requests, setRequests] = useState([]);
//   const [message, setMessage] = useState("");
//   const [isLoading, setIsLoading] = useState(false);
//   const account = useActiveAccount();
//   const { mutateAsync: sendTransaction } = useSendTransaction();

//   const contract = getContract({
//     client,
//     chain: sepolia,
//     address: contractAddress,
//     abi: contractABI,
//   });

//   // Check if connected account is owner
//   const { data: ownerAddress, isLoading: isOwnerLoading } = useReadContract({
//     contract,
//     method: "owner",
//     params: [],
//   });

//   // Fetch verification requests via events
//   const fetchRequests = async () => {
//     setIsLoading(true);
//     try {
//       // Fetch VerificationRequested events
//       const events = await contract.events.getEvents("VerificationRequested", {
//         fromBlock: 0, // Start from contract deployment (adjust if needed)
//       });

//       // Extract unique addresses and URIs
//       const pendingRequests = await Promise.all(
//         events.map(async (event) => {
//           const userAddress = event.args.user;
//           const detailsURI = event.args.detailsURI;

//           // Verify request still exists (not approved/rejected)
//           const { data: currentURI } = await useReadContract({
//             contract,
//             method: "verificationRequests",
//             params: [userAddress],
//           });

//           if (currentURI && currentURI.length > 0) {
//             return {
//               address: userAddress,
//               uri: detailsURI,
//               status: "Pending",
//             };
//           }
//           return null;
//         })
//       );

//       // Filter out null entries and set requests
//       setRequests(pendingRequests.filter((req) => req !== null));
//     } catch (error) {
//       console.error("Error fetching requests:", error);
//       setMessage("Error loading requests: " + error.message);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (
//       account &&
//       ownerAddress &&
//       account.address.toLowerCase() === ownerAddress.toLowerCase()
//     ) {
//       fetchRequests();
//       // Poll every 15 seconds for new requests
//       const interval = setInterval(fetchRequests, 15000);
//       return () => clearInterval(interval);
//     }
//   }, [account, ownerAddress]);

//   const handleVerify = async (address) => {
//     try {
//       setIsLoading(true);
//       setMessage("Processing verification...");
//       const tx = await prepareContractCall({
//         contract,
//         method: "approveVerification",
//         params: [address],
//       });
//       await sendTransaction(tx);
//       setMessage(`User ${address} verified successfully!`);
//       await fetchRequests(); // Refresh requests
//     } catch (error) {
//       setMessage(`Error verifying user: ${error.reason || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleReject = async (address) => {
//     try {
//       setIsLoading(true);
//       setMessage("Processing rejection...");
//       const tx = await prepareContractCall({
//         contract,
//         method: "removeVerifiedUser",
//         params: [address],
//       });
//       await sendTransaction(tx);
//       setMessage(`User ${address} rejected successfully!`);
//       await fetchRequests(); // Refresh requests
//     } catch (error) {
//       setMessage(`Error rejecting user: ${error.reason || error.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!account) {
//     return <p className="text-red-400 p-4">Please connect your wallet.</p>;
//   }
//   if (isOwnerLoading) {
//     return <p className="text-yellow-400 p-4">Checking admin status...</p>;
//   }
//   if (
//     ownerAddress &&
//     account.address.toLowerCase() !== ownerAddress.toLowerCase()
//   ) {
//     return <p className="text-red-400 p-4">Only the contract owner can access this page.</p>;
//   }

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 min-h-screen">
//       <motion.h1
//         className="text-3xl font-bold text-blue-400 mb-6"
//         initial={{ opacity: 0, y: -20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.5 }}
//       >
//         Admin Dashboard
//       </motion.h1>
//       {message && (
//         <p
//           className={
//             message.includes("Error") ? "text-red-400" : "text-green-400"
//           }
//         >
//           {message}
//         </p>
//       )}
//       {isLoading && <p className="text-yellow-400">Loading...</p>}
//       <div className="bg-gray-800 p-4 rounded-lg">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-xl font-semibold">Verification Requests</h2>
//           <button
//             onClick={fetchRequests}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//             disabled={isLoading}
//           >
//             Refresh
//           </button>
//         </div>
//         {requests.length === 0 ? (
//           <p>No pending requests.</p>
//         ) : (
//           <ul className="space-y-4">
//             {requests.map((req) => (
//               <li key={req.address} className="p-4 bg-gray-700 rounded-lg">
//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                   <div>
//                     <p className="font-semibold">Address:</p>
//                     <p className="truncate">{req.address}</p>
//                   </div>
//                   <div>
//                     <p className="font-semibold">Details:</p>
//                     <a
//                       href={`https://gateway.ipfs.io/ipfs/${req.uri.replace("ipfs://", "")}`}
//                       target="_blank"
//                       rel="noopener noreferrer"
//                       className="text-blue-400 hover:underline"
//                     >
//                       View Verification Data
//                     </a>
//                   </div>
//                   <div className="flex items-center gap-2">
//                     {req.status === "Pending" && (
//                       <>
//                         <button
//                           onClick={() => handleVerify(req.address)}
//                           className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//                           disabled={isLoading}
//                         >
//                           Verify
//                         </button>
//                         <button
//                           onClick={() => handleReject(req.address)}
//                           className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//                           disabled={isLoading}
//                         >
//                           Reject
//                         </button>
//                       </>
//                     )}
//                   </div>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// src/components/AdminDashboard.jsx
// import { useState, useEffect } from "react";
// import { useSendTransaction, useActiveAccount, useReadContract } from "thirdweb/react";
// import { prepareContractCall } from "thirdweb";

// // Hardcoded admin addresses (case-insensitive)
// const ALLOWED_ADMINS = [
//   "0x94a049c1cbd9afac99d7da46a6d7911440e2920b", // Ensure lowercase
//   // Add more addresses as needed
// ];

// // Custom hook for submitted users
// const useSubmittedUsers = (contract, isAdmin) => {
//   const { data, error } = useReadContract({
//     contract,
//     method: "function getSubmittedUsers() view returns (address[])",
//     queryOptions: { enabled: isAdmin && !!contract },
//   });

//   return { users: data || [], error };
// };

// // Custom hook for user form
// const useUserForm = (contract, userAddress, isAdmin) => {
//   const { data, error } = useReadContract({
//     contract,
//     method: "function getUserForm(address _user) view returns (string, string, string, uint8)",
//     params: userAddress ? [userAddress] : undefined,
//     queryOptions: { enabled: isAdmin && !!contract && !!userAddress },
//   });

//   return {
//     userForm: data
//       ? {
//           userAddress,
//           name: data[0],
//           company: data[1],
//           website: data[2],
//           status: Number(data[3]),
//         }
//       : null,
//     error,
//   };
// };

// const AdminDashboard = ({ contract }) => {
//   const account = useActiveAccount();
//   const { mutateAsync: sendTransaction, isPending } = useSendTransaction();

//   const [selectedUser, setSelectedUser] = useState(null);
//   const [newAdminAddress, setNewAdminAddress] = useState("");
//   const [removeAdminAddress, setRemoveAdminAddress] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   // Check admin status (case-insensitive)
//   const isAdmin = account && ALLOWED_ADMINS.includes(account.address.toLowerCase());

//   // Log for debugging
//   useEffect(() => {
//     console.log("Account:", account?.address);
//     console.log("Normalized Account:", account?.address?.toLowerCase());
//     console.log("ALLOWED_ADMINS:", ALLOWED_ADMINS);
//     console.log("Contract address:", contract?.address);
//     console.log("Chain ID:", contract?.chain?.id);
//     console.log("Is Admin:", isAdmin);
//   }, [account, contract, isAdmin]);

//   // Use custom hooks only if admin
//   const { users: submittedUsers, error: usersError } = isAdmin ? useSubmittedUsers(contract, isAdmin) : { users: [], error: null };
//   const { userForm, error: formError } = isAdmin ? useUserForm(contract, selectedUser, isAdmin) : { userForm: null, error: null };

//   useEffect(() => {
//     if (isAdmin) {
//       console.log("Submitted Users:", submittedUsers);
//       if (usersError) {
//         console.error("Submitted users error:", usersError);
//         setErrorMessage("Error fetching submitted users: " + (usersError.message || "Unknown error"));
//       }
//       if (formError) {
//         console.error("User form error:", formError);
//         setErrorMessage("Error fetching user form: " + formError.message);
//       }
//     }
//   }, [isAdmin, submittedUsers, usersError, formError]);

//   // Approve user
//   const handleApprove = async (userAddress) => {
//     if (!account) {
//       alert("Please connect your wallet");
//       return;
//     }

//     try {
//       setSuccessMessage("");
//       setErrorMessage("");
//       const transaction = prepareContractCall({
//         contract,
//         method: "function approveUser(address _user)",
//         params: [userAddress],
//       });

//       const result = await sendTransaction(transaction);
//       if (result.transactionHash) {
//         setSuccessMessage(`User ${userAddress.slice(0, 6)}... approved successfully!`);
//         setSelectedUser(userAddress); // Refresh form
//       }
//     } catch (error) {
//       setErrorMessage("Error approving user: " + (error.reason || error.message));
//     }
//   };

//   // Reject user
//   const handleReject = async (userAddress) => {
//     if (!account) {
//       alert("Please connect your wallet");
//       return;
//     }

//     try {
//       setSuccessMessage("");
//       setErrorMessage("");
//       const transaction = prepareContractCall({
//         contract,
//         method: "function rejectUser(address)",
//         params: [userAddress],
//       });

//       const result = await sendTransaction(transaction);
//       if (result.transactionHash) {
//         setSuccessMessage(`User ${userAddress.slice(0, 6)}... rejected successfully!`);
//         setSelectedUser(userAddress); // Refresh form
//       }
//     } catch (error) {
//       setErrorMessage("Error rejecting user: " + (error.reason || error.message));
//     }
//   };

//   // Add admin
//   const handleAddAdmin = async () => {
//     if (!account) {
//       alert("Please connect your wallet");
//       return;
//     }

//     if (!newAdminAddress || !/^(0x)?[0-9a-fA-F]{40}$/.test(newAdminAddress)) {
//       alert("Invalid Ethereum address");
//       return;
//     }

//     try {
//       setSuccessMessage("");
//       setErrorMessage("");
//       const transaction = prepareContractCall({
//         contract,
//         method: "function addAdmin(address)",
//         params: [newAdminAddress],
//       });

//       const result = await sendTransaction(transaction);
//       if (result.transactionHash) {
//         setSuccessMessage(`Admin ${newAdminAddress.slice(0, 6)}... added successfully!`);
//         ALLOWED_ADMINS.push(newAdminAddress.toLowerCase());
//         setNewAdminAddress("");
//       }
//     } catch (error) {
//       setErrorMessage("Error adding admin: " + (error.reason || error.message));
//     }
//   };

//   // Remove admin
//   const handleRemoveAdmin = async () => {
//     if (!account) {
//       alert("Please connect your wallet");
//       return;
//     }

//     if (!removeAdminAddress || !/^(0x)?[0-9a-fA-F]{40}$/.test(removeAdminAddress)) {
//       alert("Invalid email address");
//       return;
//     }

//     try {
//       setSuccessMessage("");
//       setErrorMessage("");
//       const transaction = prepareContractCall({
//         contract,
//         method: "function removeAdmin(address)",
//         params: [removeAdminAddress],
//       });

//       const result = await sendTransaction(transaction);
//       if (result.transactionHash) {
//         setSuccessMessage(`Admin ${removeAdminAddress.slice(0, 6)}... removed successfully!`);
//         const index = ALLOWED_ADMINS.indexOf(removeAdminAddress.toLowerCase());
//         if (index > -1) ALLOWED_ADMINS.splice(index, 1);
//         setRemoveAdminAddress("");
//       }
//     } catch (error) {
//       setErrorMessage("Error removing admin: " + (error.reason || error.message));
//     }
//   };

//   // Select user to view form
//   const handleSelectUser = (userAddress) => {
//     setSelectedUser(userAddress);
//   };

//   if (!isAdmin) {
//     return (
//       <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
//         <h2 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h2>
//         <p className="text-red-600 text-center">Access denied: You are not authorized to view this page.</p>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-4xl mx-auto p-6 bg-whit rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h2>

//       {successMessage && (
//         <p className="text-green-600 font-semibold mb-4 text-center">{successMessage}</p>
//       )}
//       {errorMessage && (
//         <p className="text-red-600 font-semibold mb-4 text-center">{errorMessage}</p>
//       )}

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Submitted Users */}
//         <div>
//           <h3 className="text-lg font-semibold mb-2">Submitted Users</h3>
//           {usersError ? (
//             <p className="text-red-600">Unable to fetch users. No users may be submitted yet.</p>
//           ) : submittedUsers.length === 0 ? (
//             <p className="text-gray-600">No submissions yet.</p>
//           ) : (
//             <div className="space-y-2 max-h-96 overflow-y-auto">
//               {submittedUsers.map((userAddress) => (
//                 <button
//                   key={userAddress}
//                   onClick={() => handleSelectUser(userAddress)}
//                   className={`w-full p-3 text-left rounded-lg ${
//                     selectedUser === userAddress
//                       ? "bg-blue-100 border-blue-500"
//                       : "bg-gray-100 hover:bg-gray-200"
//                   } border transition-colors`}
//                 >
//                   {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
//                 </button>
//               ))}
//             </div>
//           )}
//         </div>

//         {/* Selected User Form */}
//         <div>
//           {userForm ? (
//             <div className="p-4 bg-gray-600 rounded-lg">
//               <h3 className="text-lg font-semibold mb-2">User Form Details</h3>
//               <p><strong>Address:</strong> {userForm.userAddress}</p>
//               <p><strong>Name:</strong> {userForm.name}</p>
//               <p><strong>Company:</strong> {userForm.company}</p>
//               <p><strong>Website:</strong> {userForm.website}</p>
//               <p>
//                 <strong>Status:</strong>{" "}
//                 {userForm.status === 0
//                   ? "⏳ Pending Review"
//                   : userForm.status === 1
//                   ? "✅ Approved"
//                   : "❌ Rejected"}
//               </p>
//               {userForm.status === 0 && (
//                 <div className="flex gap-4 mt-4">
//                   <button
//                     onClick={() => handleApprove(userForm.userAddress)}
//                     disabled={isPending}
//                     className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
//                   >
//                     Approve
//                   </button>
//                   <button
//                     onClick={() => handleReject(userForm.userAddress)}
//                     disabled={isPending}
//                     className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
//                   >
//                     Reject
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <p className="text-gray-600">Select a user to view their form.</p>
//           )}
//         </div>
//       </div>

//       {/* Admin Management */}
//       <div className="mt-8 p-4 bg-gray-600 rounded-lg">
//         <h3 className="text-lg font-semibold mb-4">Manage Contract Admins</h3>
//         <div className="space-y-4">
//           <input
//             type="text"
//             placeholder="New Admin Address (0x...)"
//             value={newAdminAddress}
//             onChange={(e) => setNewAdminAddress(e.target.value)}
//             disabled={isPending}
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
//           />
//           <button
//             onClick={handleAddAdmin}
//             disabled={isPending || !newAdminAddress}
//             className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
//           >
//             Add Admin
//           </button>
//           <input
//             type="text"
//             placeholder="Admin Address to Remove (0x...)"
//             value={removeAdminAddress}
//             onChange={(e) => setNewAdminAddress(e.target.value)}
//             disabled={isPending}
//             className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
//           />
//           <button
//             onClick={handleRemoveAdmin}
//             disabled={isPending || !removeAdminAddress}
//             className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
//           >
//             Remove Admin
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

// src/components/AdminDashboard.jsx
import { useState, useEffect } from "react";
import {
  useSendTransaction,
  useActiveAccount,
  useReadContract,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";

// Hardcoded admin addresses (lowercase)
const ALLOWED_ADMINS = [
  "0x94a049c1cbd9afac99d7da46a6d7911440e2920b",
  // Add more addresses as needed
];

// Custom hook for submitted users
const useSubmittedUsers = (contract, isAdmin) => {
  const { data, error } = useReadContract({
    contract,
    method: "function getSubmittedUsers() view returns (address[])",
    queryOptions: { enabled: isAdmin && !!contract },
  });

  return { users: data || [], error };
};

// Custom hook for user form
const useUserForm = (contract, userAddress, isAdmin, refreshKey) => {
  const { data, error, refetch } = useReadContract({
    contract,
    method:
      "function getUserForm(address _user) view returns (string, string, string, uint8)",
    params: userAddress ? [userAddress] : undefined,
    queryOptions: { enabled: isAdmin && !!contract && !!userAddress },
    key: [userAddress, refreshKey], // Force refresh on key change
  });

  return {
    userForm: data
      ? {
          userAddress,
          name: data[0],
          company: data[1],
          website: data[2],
          status: Number(data[3]),
        }
      : null,
    error,
    refetch,
  };
};

const AdminDashboard = ({ contract }) => {
  const account = useActiveAccount();
  const {
    mutateAsync: sendTransaction,
    isPending,
    error: txError,
  } = useSendTransaction();

  const [selectedUser, setSelectedUser] = useState(null);
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [removeAdminAddress, setRemoveAdminAddress] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0); // For forcing form refresh

  // Check admin status
  const isAdmin =
    account && ALLOWED_ADMINS.includes(account.address.toLowerCase());

  // Debugging logs
  useEffect(() => {
    console.log("Account:", account?.address);
    console.log("Normalized Account:", account?.address?.toLowerCase());
    console.log("ALLOWED_ADMINS:", ALLOWED_ADMINS);
    console.log("Contract address:", contract?.address);
    console.log("Chain ID:", contract?.chain?.id);
    console.log("Is Admin:", isAdmin);
    console.log("Transaction Error:", txError);
  }, [account, contract, isAdmin, txError]);

  // Use custom hooks only if admin
  const { users: submittedUsers, error: usersError } = isAdmin
    ? useSubmittedUsers(contract, isAdmin)
    : { users: [], error: null };
  const {
    userForm,
    error: formError,
    refetch: refetchUserForm,
  } = isAdmin
    ? useUserForm(contract, selectedUser, isAdmin, refreshKey)
    : { userForm: null, error: null, refetch: () => {} };

  useEffect(() => {
    if (isAdmin) {
      console.log("Submitted Users:", submittedUsers);
      if (usersError) {
        console.error("Submitted users error:", usersError);
        setErrorMessage(
          "Error fetching submitted users: " +
            (usersError.message || "Unknown error")
        );
      }
      if (formError) {
        console.error("User form error:", formError);
        setErrorMessage("Error fetching user form: " + formError.message);
      }
    }
  }, [isAdmin, submittedUsers, usersError, formError]);

  // Approve user
  const handleApprove = async (userAddress) => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setSuccessMessage("");
      setErrorMessage("");
      console.log("Approving user:", userAddress);
      const transaction = prepareContractCall({
        contract,
        method: "function approveUser(address _user)",
        params: [userAddress],
      });

      const result = await sendTransaction(transaction);
      if (result.transactionHash) {
        setSuccessMessage(
          `User ${userAddress.slice(0, 6)}... approved successfully!`
        );
        setRefreshKey((prev) => prev + 1); // Trigger form refresh
        refetchUserForm();
      }
    } catch (error) {
      console.error("Approve error:", error);
      setErrorMessage(
        "Error approving user: " + (error.reason || error.message)
      );
    }
  };

  // Reject user
  const handleReject = async (userAddress) => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setSuccessMessage("");
      setErrorMessage("");
      console.log("Rejecting user:", userAddress);
      const transaction = prepareContractCall({
        contract,
        method: "function rejectUser(address _user)",
        params: [userAddress],
      });

      const result = await sendTransaction(transaction);
      if (result.transactionHash) {
        setSuccessMessage(
          `User ${userAddress.slice(0, 6)}... rejected successfully!`
        );
        setRefreshKey((prev) => prev + 1); // Trigger form refresh
        refetchUserForm();
      }
    } catch (error) {
      console.error("Reject error:", error);
      setErrorMessage(
        "Error rejecting user: " + (error.reason || error.message)
      );
    }
  };

  // Add admin
  const handleAddAdmin = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    if (!newAdminAddress || !/^(0x)?[0-9a-fA-F]{40}$/.test(newAdminAddress)) {
      setErrorMessage("Invalid Ethereum address");
      return;
    }

    try {
      setSuccessMessage("");
      setErrorMessage("");
      const normalizedAddress = newAdminAddress.toLowerCase();
      const transaction = prepareContractCall({
        contract,
        method: "function addAdmin(address _newAdmin)",
        params: [normalizedAddress],
      });

      const result = await sendTransaction(transaction);
      if (result.transactionHash) {
        setSuccessMessage(
          `Admin ${normalizedAddress.slice(0, 6)}... added successfully!`
        );
        if (!ALLOWED_ADMINS.includes(normalizedAddress)) {
          ALLOWED_ADMINS.push(normalizedAddress);
        }
        setNewAdminAddress("");
      }
    } catch (error) {
      console.error("Add admin error:", error);
      setErrorMessage("Error adding admin: " + (error.reason || error.message));
    }
  };

  // Remove admin
  const handleRemoveAdmin = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    if (
      !removeAdminAddress ||
      !/^(0x)?[0-9a-fA-F]{40}$/.test(removeAdminAddress)
    ) {
      setErrorMessage("Invalid Ethereum address");
      return;
    }

    try {
      setSuccessMessage("");
      setErrorMessage("");
      const normalizedAddress = removeAdminAddress.toLowerCase();
      const transaction = prepareContractCall({
        contract,
        method: "function removeAdmin(address _admin)",
        params: [normalizedAddress],
      });

      const result = await sendTransaction(transaction);
      if (result.transactionHash) {
        setSuccessMessage(
          `Admin ${normalizedAddress.slice(0, 6)}... removed successfully!`
        );
        const index = ALLOWED_ADMINS.indexOf(normalizedAddress);
        if (index > -1) {
          ALLOWED_ADMINS.splice(index, 1);
        }
        setRemoveAdminAddress("");
      }
    } catch (error) {
      console.error("Remove admin error:", error);
      setErrorMessage(
        "Error removing admin: " + (error.reason || error.message)
      );
    }
  };

  // Select user to view form
  const handleSelectUser = (userAddress) => {
    setSelectedUser(userAddress);
  };

  if (!account) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-whit rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h2>
        <p className="text-red-600 text-center">
          Please connect your wallet to access this page.
        </p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-whit rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h2>
        <p className="text-red-600 text-center">
          Access denied: You are not authorized to view this page.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-600 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">Admin Dashboard</h2>

      {successMessage && (
        <p className="text-green-600 font-semibold mb-4 text-center">
          {successMessage}
        </p>
      )}
      {errorMessage && (
        <p className="text-red-600 font-semibold mb-4 text-center">
          {errorMessage}
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-co gap-6">
        {/* Submitted Users */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Submitted Users</h3>
          {usersError ? (
            <p className="text-red-600">
              Unable to fetch users. No users may be submitted yet.
            </p>
          ) : submittedUsers.length === 0 ? (
            <p className="text-gray-600">No submissions yet.</p>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {submittedUsers.map((userAddress) => (
                <button
                  key={userAddress}
                  onClick={() => handleSelectUser(userAddress)}
                  className={`w-full p-3 text-left rounded-lg ${
                    selectedUser === userAddress
                      ? "bg-blue-100 border-blue-500"
                      : "bg-gray-100 hover:bg-gray-200"
                  } border transition-colors`}
                >
                  {userAddress.slice(0, 6)}...{userAddress.slice(-4)}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Selected User Form */}
        <div>
          {userForm ? (
            <div className="p-4 bg-gray-500 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">User Form Details</h3>
              <p>
                <strong>Address:</strong> {userForm.userAddress}
              </p>
              <p>
                <strong>Name:</strong> {userForm.name}
              </p>
              <p>
                <strong>Company:</strong> {userForm.company}
              </p>
              <p>
                <strong>Website:</strong> {userForm.website}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {userForm.status === 0
                  ? "⏳ Pending Review"
                  : userForm.status === 1
                  ? "✅ Approved"
                  : "❌ Rejected"}
              </p>
              {userForm.status === 0 && (
                <div className="flex gap-4 mt-4">
                  <button
                    onClick={() => handleApprove(userForm.userAddress)}
                    disabled={isPending}
                    className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(userForm.userAddress)}
                    disabled={isPending}
                    className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600">Select a user to view their form.</p>
          )}
        </div>
      </div>

      {/* Admin Management */}
      <div className="mt-8 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4">Manage Contract Admins</h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="New Admin Address (0x...)"
            value={newAdminAddress}
            onChange={(e) => setNewAdminAddress(e.target.value)}
            disabled={isPending}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
          <button
            onClick={handleAddAdmin}
            disabled={isPending || !newAdminAddress}
            className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            Add Admin
          </button>
          <input
            type="text"
            placeholder="Admin Address to Remove (0x...)"
            value={removeAdminAddress}
            onChange={(e) => setRemoveAdminAddress(e.target.value)}
            disabled={isPending}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
          />
          <button
            onClick={handleRemoveAdmin}
            disabled={isPending || !removeAdminAddress}
            className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            Remove Admin
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
