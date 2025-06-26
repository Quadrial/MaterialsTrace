// // src/components/MyTokens.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { ethers } from "ethers";
// import { motion } from "framer-motion";
// import { FaSpinner } from "react-icons/fa";
// import {
//   useActiveAccount,
//   useReadContract,
//   useSendTransaction,
// } from "thirdweb/react";
// import { prepareContractCall } from "thirdweb";

// const MaterialCard = ({
//   contract,
//   materialId,
//   account,
//   isDeleting,
//   setIsDeleting,
//   setErrorMessage,
//   setRegisteredMaterials,
//   isPurchased = false,
// }) => {
//   const navigate = useNavigate();

//   // Fetch material details
//   const { data, isPending, error } = useReadContract({
//     contract,
//     method:
//       "function materials(uint256 _index) view returns (uint256 materialId, address seller, string materialType, string weight, string purity, string origin, uint256 priceUSDPerTon, uint256 maxSupply, uint256 mintedSupply, string imageURI, bool isAvailable)",
//     params: [BigInt(materialId)],
//     queryOptions: { enabled: !!contract && materialId > 0 },
//   });

//   // Fetch ETH price
//   const { data: priceInETH, error: priceError } = useReadContract({
//     contract,
//     method: "function getPriceInETH(uint256) view returns (uint256)",
//     params: [data ? data[6] : BigInt(0)], // priceUSDPerTon
//     queryOptions: { enabled: !!data && !!contract && data[6] > 0 },
//   });

//   // Fallback ETH price calculation
//   const fallbackETHPrice = (priceUSD) => {
//     const ethUSD = 2000; // Fallback ETH/USD price
//     const safePriceUSD = isNaN(priceUSD) || priceUSD < 0 ? 0 : priceUSD;
//     return ethers.formatEther(
//       BigInt(Math.floor((safePriceUSD * 1e18) / ethUSD))
//     );
//   };

//   const { mutate: sendTransaction } = useSendTransaction();

//   const handleDelete = async (materialId) => {
//     if (!account) {
//       setErrorMessage("Please connect your wallet");
//       return;
//     }

//     try {
//       setIsDeleting((prev) => ({ ...prev, [materialId]: true }));
//       const transaction = await prepareContractCall({
//         contract,
//         method: "function deleteMaterial(uint256 _materialId)",
//         params: [BigInt(materialId)],
//       });

//       await sendTransaction(transaction, {
//         onSuccess: (result) => {
//           console.log("deleteMaterial successful:", result.transactionHash);
//           setRegisteredMaterials((prev) =>
//             prev.filter((m) => m.materialId !== materialId)
//           );
//           setErrorMessage("");
//         },
//         onError: (err) => {
//           throw err;
//         },
//       });
//     } catch (err) {
//       console.error("Delete error:", err);
//       setErrorMessage(
//         "Error deleting material: " + (err.reason || err.message)
//       );
//     } finally {
//       setIsDeleting((prev) => ({ ...prev, [materialId]: false }));
//     }
//   };

//   const handleTrack = (materialId) => {
//     navigate(`/track-supply-chain?materialId=${materialId}`);
//   };

//   if (isPending || !data) return null;
//   if (error) {
//     console.error(`Error fetching material ${materialId}:`, error);
//     return null;
//   }

//   const material = {
//     materialId: Number(data[0]),
//     seller: data[1],
//     materialType: data[2],
//     weight: data[3],
//     purity: data[4],
//     origin: data[5],
//     priceUSDPerTon: Number(ethers.formatUnits(data[6], 0)), // No decimals in contract
//     maxSupply: Number(data[7]),
//     mintedSupply: Number(data[8]),
//     imageURI: data[9],
//     isAvailable: data[10],
//   };

//   const displayETHPrice = (() => {
//     try {
//       if (
//         priceInETH &&
//         !priceError &&
//         priceInETH <= ethers.parseEther("1000")
//       ) {
//         return ethers.formatEther(BigInt(priceInETH));
//       }
//       return fallbackETHPrice(material.priceUSDPerTon);
//     } catch (err) {
//       console.error(
//         `Error formatting ETH price for material ${materialId}:`,
//         err
//       );
//       return "N/A";
//     }
//   })();

//   return (
//     <motion.div
//       key={materialId}
//       className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col"
//       whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
//     >
//       <img
//         src={material.imageURI}
//         alt={material.materialType}
//         className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
//       />
//       <h3 className="text-base sm:text-lg font-semibold text-white truncate">
//         {material.materialType}
//       </h3>
//       <div className="text-sm sm:text-base text-gray-300 space-y-1 flex-grow">
//         <p>
//           <strong>Material ID:</strong> {material.materialId}
//         </p>
//         <p>
//           <strong>Weight:</strong> {material.weight}
//         </p>
//         <p>
//           <strong>Purity:</strong> {material.purity}
//         </p>
//         <p>
//           <strong>Origin:</strong> {material.origin}
//         </p>
//         <p>
//           <strong>Price:</strong> ${material.priceUSDPerTon} USD / USDT (
//           {displayETHPrice} ETH)
//         </p>
//         <p>
//           <strong>Supply:</strong> {material.mintedSupply}/{material.maxSupply}
//         </p>
//       </div>
//       <div className="mt-4">
//         <button
//           onClick={() => handleTrack(material.materialId)}
//           className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm sm:text-base"
//         >
//           Track
//         </button>
//         {!isPurchased && (
//           <button
//             onClick={() => handleDelete(material.materialId)}
//             disabled={
//               isDeleting[material.materialId] ||
//               !material.isAvailable ||
//               material.mintedSupply > 0
//             }
//             className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm sm:text-base disabled:bg-gray-400"
//           >
//             {isDeleting[material.materialId] ? (
//               <FaSpinner className="animate-spin mx-auto" />
//             ) : (
//               "Delete"
//             )}
//           </button>
//         )}
//       </div>
//     </motion.div>
//   );
// };

// const MyTokens = ({ contract }) => {
//   const account = useActiveAccount();
//   const [registeredMaterials, setRegisteredMaterials] = useState([]);
//   const [boughtMaterials, setBoughtMaterials] = useState([]);
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isDeleting, setIsDeleting] = useState({});

//   // Fetch registered material IDs
//   const { data: registeredMaterialIds, error: registeredError } =
//     useReadContract({
//       contract,
//       method:
//         "function getUserRegisteredMaterials(address _user) view returns (uint256[])",
//       params: [account?.address || ethers.ZeroAddress],
//       queryOptions: { enabled: !!contract && !!account },
//     });

//   // Fetch purchased material IDs
//   const { data: purchasedMaterialIds, error: purchasedError } = useReadContract(
//     {
//       contract,
//       method:
//         "function getUserPurchasedMaterials(address _user) view returns (uint256[])",
//       params: [account?.address || ethers.ZeroAddress],
//       queryOptions: { enabled: !!contract && !!account },
//     }
//   );

//   useEffect(() => {
//     if (!contract || !account || registeredError || purchasedError) {
//       setErrorMessage("Contract, account, or material data not available");
//       return;
//     }

//     // No need to fetch materials here; MaterialCard handles it
//     setRegisteredMaterials(
//       registeredMaterialIds ? registeredMaterialIds.map(Number) : []
//     );
//     setBoughtMaterials(
//       purchasedMaterialIds ? purchasedMaterialIds.map(Number) : []
//     );
//   }, [
//     contract,
//     account,
//     registeredMaterialIds,
//     purchasedMaterialIds,
//     registeredError,
//     purchasedError,
//   ]);

//   if (!contract || !contract.chain) {
//     return (
//       <div className="p-4 bg-gray-900 text-gray-200 min-h-screen">
//         <h1 className="text-xl md:text-3xl font-bold text-blue-400 mb-6">
//           My Tokens
//         </h1>
//         <p className="text-red-500 text-center text-sm sm:text-base">
//           Error: Contract not properly configured. Please check client.js.
//         </p>
//       </div>
//     );
//   }

//   return (
//     <div className="p-4 bg-gray-900 text-gray-200 min-h-screen">
//       <h1 className="text-xl md:text-3xl font-bold text-blue-400 mb-6">
//         My Tokens
//       </h1>
//       {errorMessage && (
//         <p className="text-red-500 mb-4 text-center text-sm sm:text-base">
//           {errorMessage}
//         </p>
//       )}

//       <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
//         Registered Materials
//       </h2>
//       {registeredMaterials.length > 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
//           {registeredMaterials.map((materialId) => (
//             <MaterialCard
//               key={materialId}
//               contract={contract}
//               materialId={materialId}
//               account={account}
//               isDeleting={isDeleting}
//               setIsDeleting={setIsDeleting}
//               setErrorMessage={setErrorMessage}
//               setRegisteredMaterials={setRegisteredMaterials}
//               isPurchased={false}
//             />
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-400 text-sm sm:text-base">
//           No materials registered. Mint some in the Dashboard!
//         </p>
//       )}

//       <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 mt-8">
//         Bought Materials
//       </h2>
//       {boughtMaterials.length > 0 ? (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
//           {boughtMaterials.map((materialId) => (
//             <MaterialCard
//               key={materialId}
//               contract={contract}
//               materialId={materialId}
//               account={account}
//               isDeleting={isDeleting}
//               setIsDeleting={setIsDeleting}
//               setErrorMessage={setErrorMessage}
//               setRegisteredMaterials={setRegisteredMaterials}
//               isPurchased={true}
//             />
//           ))}
//         </div>
//       ) : (
//         <p className="text-gray-400 text-sm sm:text-base">
//           No materials bought. Purchase some in the Dashboard!
//         </p>
//       )}
//     </div>
//   );
// };

// export default MyTokens;

// src/components/MyTokens.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";

const MaterialCard = ({
  contract,
  materialId,
  account,
  isDeleting,
  setIsDeleting,
  setErrorMessage,
  setRegisteredMaterials,
  isPurchased = false,
}) => {
  const navigate = useNavigate();

  // Fetch material details
  const { data, isPending, error } = useReadContract({
    contract,
    method:
      "function materials(uint256 _index) view returns (uint256 materialId, address seller, string materialType, string weight, string purity, string origin, uint256 priceUSDPerTon, uint256 maxSupply, uint256 mintedSupply, string imageURI, bool isAvailable)",
    params: [BigInt(materialId)],
    queryOptions: { enabled: !!contract && materialId > 0 },
  });

  // Fetch ETH price
  const { data: priceInETH, error: priceError } = useReadContract({
    contract,
    method: "function getPriceInETH(uint256) view returns (uint256)",
    params: [data ? data[6] : BigInt(0)], // priceUSDPerTon
    queryOptions: { enabled: !!data && !!contract && data[6] > 0 },
  });

  // Fallback ETH price calculation
  const fallbackETHPrice = (priceUSD) => {
    const ethUSD = 2000; // Fallback ETH/USD price
    const safePriceUSD = isNaN(priceUSD) || priceUSD < 0 ? 0 : priceUSD;
    return ethers.formatEther(
      BigInt(Math.floor((safePriceUSD * 1e18) / ethUSD))
    );
  };

  const { mutate: sendTransaction } = useSendTransaction();

  const handleDelete = async (materialId) => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setIsDeleting((prev) => ({ ...prev, [materialId]: true }));
      const transaction = await prepareContractCall({
        contract,
        method: "function deleteMaterial(uint256 _materialId)",
        params: [BigInt(materialId)],
      });

      await sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("deleteMaterial successful:", result.transactionHash);
          setRegisteredMaterials((prev) =>
            prev.filter((m) => m.materialId !== materialId)
          );
          setErrorMessage("");
        },
        onError: (err) => {
          throw err;
        },
      });
    } catch (err) {
      console.error("Delete error:", err);
      setErrorMessage(
        "Error deleting material: " + (err.reason || err.message)
      );
    } finally {
      setIsDeleting((prev) => ({ ...prev, [materialId]: false }));
    }
  };

  const handleTrack = (materialId) => {
    navigate(`/track-supply-chain?materialId=${materialId}`);
  };

  if (isPending || !data) return null;
  if (error) {
    console.error(`Error fetching material ${materialId}:`, error);
    return null;
  }

  const material = {
    materialId: Number(data[0]),
    seller: data[1],
    materialType: data[2],
    weight: data[3],
    purity: data[4],
    origin: data[5],
    priceUSDPerTon: Number(ethers.formatUnits(data[6], 18)), // No decimals in contract
    maxSupply: Number(data[7]),
    mintedSupply: Number(data[8]),
    imageURI: data[9],
    isAvailable: data[10],
  };

  const displayETHPrice = (() => {
    try {
      if (
        priceInETH &&
        !priceError &&
        priceInETH <= ethers.parseEther("1000")
      ) {
        return ethers.formatEther(BigInt(priceInETH));
      }
      return fallbackETHPrice(material.priceUSDPerTon);
    } catch (err) {
      console.error(
        `Error formatting ETH price for material ${materialId}:`,
        err
      );
      return "N/A";
    }
  })();

  return (
    <motion.div
      key={materialId}
      className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col"
      whileHover={{ scale: 1.05, transition: { duration: 0.3 } }}
    >
      <img
        src={material.imageURI}
        alt={material.materialType}
        className="w-full h-40 sm:h-48 object-cover rounded-lg mb-4"
      />
      <h3 className="text-base sm:text-lg font-semibold text-white truncate">
        {material.materialType}
      </h3>
      <div className="text-sm sm:text-base text-gray-300 space-y-1 flex-grow">
        <p>
          <strong>Material ID:</strong> {material.materialId}
        </p>
        <p>
          <strong>Weight:</strong> {material.weight}
        </p>
        <p>
          <strong>Purity:</strong> {material.purity}
        </p>
        <p>
          <strong>Origin:</strong> {material.origin}
        </p>
        <p>
          <strong>Price:</strong> ${material.priceUSDPerTon} USD / USDT (
          {displayETHPrice} ETH)
        </p>
        <p>
          <strong>Supply:</strong> {material.mintedSupply}/{material.maxSupply}
        </p>
      </div>
      <div className="mt-4">
        <button
          onClick={() => handleTrack(material.materialId)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm sm:text-base"
        >
          Track
        </button>
        {!isPurchased && (
          <button
            onClick={() => handleDelete(material.materialId)}
            disabled={
              isDeleting[material.materialId] ||
              !material.isAvailable ||
              material.mintedSupply > 0
            }
            className="w-full mt-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm sm:text-base disabled:bg-gray-400"
          >
            {isDeleting[material.materialId] ? (
              <FaSpinner className="animate-spin mx-auto" />
            ) : (
              "Delete"
            )}
          </button>
        )}
      </div>
    </motion.div>
  );
};

const MyTokens = ({ contract }) => {
  const account = useActiveAccount();
  const [registeredMaterials, setRegisteredMaterials] = useState([]);
  const [boughtMaterials, setBoughtMaterials] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState({});

  // Fetch registered material IDs
  const { data: registeredMaterialIds, error: registeredError } =
    useReadContract({
      contract,
      method:
        "function getUserRegisteredMaterials(address _user) view returns (uint256[])",
      params: [account?.address || ethers.ZeroAddress],
      queryOptions: { enabled: !!contract && !!account },
    });

  // Fetch purchased material IDs
  const { data: purchasedMaterialIds, error: purchasedError } = useReadContract(
    {
      contract,
      method:
        "function getUserPurchasedMaterials(address _user) view returns (uint256[])",
      params: [account?.address || ethers.ZeroAddress],
      queryOptions: { enabled: !!contract && !!account },
    }
  );

  useEffect(() => {
    if (!contract || !account || registeredError || purchasedError) {
      setErrorMessage("Contract, account, or material data not available");
      return;
    }

    // Set material IDs for rendering
    setRegisteredMaterials(
      registeredMaterialIds ? registeredMaterialIds.map(Number) : []
    );
    setBoughtMaterials(
      purchasedMaterialIds ? purchasedMaterialIds.map(Number) : []
    );
  }, [
    contract,
    account,
    registeredMaterialIds,
    purchasedMaterialIds,
    registeredError,
    purchasedError,
  ]);

  if (!contract || !contract.chain) {
    return (
      <div className="p-4 bg-gray-900 text-gray-200 min-h-screen">
        <h1 className="text-xl md:text-3xl font-bold text-blue-400 mb-6">
          My Tokens
        </h1>
        <p className="text-red-500 text-center text-sm sm:text-base">
          Error: Contract not properly configured. Please check client.js.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen">
      <h1 className="text-xl md:text-3xl font-bold text-blue-400 mb-6">
        My Tokens
      </h1>
      {errorMessage && (
        <p className="text-red-500 mb-4 text-center text-sm sm:text-base">
          {errorMessage}
        </p>
      )}

      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4">
        Registered Materials
      </h2>
      {registeredMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {registeredMaterials.map((materialId) => (
            <MaterialCard
              key={materialId}
              contract={contract}
              materialId={materialId}
              account={account}
              isDeleting={isDeleting}
              setIsDeleting={setIsDeleting}
              setErrorMessage={setErrorMessage}
              setRegisteredMaterials={setRegisteredMaterials}
              isPurchased={false}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm sm:text-base">
          No materials registered. Mint some in the Dashboard!
        </p>
      )}

      <h2 className="text-lg sm:text-xl font-semibold text-white mb-4 mt-8">
        Bought Materials
      </h2>
      {boughtMaterials.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto">
          {boughtMaterials.map((materialId) => (
            <MaterialCard
              key={materialId}
              contract={contract}
              materialId={materialId}
              account={account}
              isDeleting={isDeleting}
              setIsDeleting={setIsDeleting}
              setErrorMessage={setErrorMessage}
              setRegisteredMaterials={setRegisteredMaterials}
              isPurchased={true}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-sm sm:text-base">
          No materials bought. Purchase some in the Dashboard!
        </p>
      )}
    </div>
  );
};

export default MyTokens;
