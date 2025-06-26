// // src/components/MintingPage.jsx
// import { useState, useEffect } from "react";
// import {
//   useActiveAccount,
//   useSendTransaction,
//   useReadContract,
// } from "thirdweb/react";
// import { prepareContractCall, readContract } from "thirdweb";
// import { ethers } from "ethers";
// import axios from "axios";
// import { motion } from "framer-motion";
// import { FaSpinner } from "react-icons/fa";

// const uploadToPinata = async (file) => {
//   const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
//   const formData = new FormData();
//   formData.append("file", file);

//   const apiKey = import.meta.env.VITE_PINATA_API_KEY;
//   const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

//   if (!apiKey || !secretKey) {
//     throw new Error("Pinata API key or secret is not defined");
//   }

//   console.log("Pinata API Key:", apiKey);
//   try {
//     const response = await axios.post(url, formData, {
//       headers: {
//         "Content-Type": "multipart/form-data",
//         pinata_api_key: apiKey,
//         pinata_secret_api_key: secretKey,
//       },
//     });
//     return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
//   } catch (error) {
//     console.error("Pinata upload error:", error.response || error);
//     throw new Error(
//       "Pinata upload failed: " + (error.response?.data?.error || error.message)
//     );
//   }
// };

// const materialOptions = [
//   { type: "Steel", priceUSDPerTon: 500 }, // Placeholder prices
//   { type: "Aluminum", priceUSDPerTon: 2000 },
//   { type: "Copper", priceUSDPerTon: 8000 },
// ];

// const MintingPage = ({ contract }) => {
//   const account = useActiveAccount();
//   const { mutate: sendTransaction } = useSendTransaction();
//   const [form, setForm] = useState({
//     materialType: "",
//     weight: "", // In kg
//     purity: "",
//     origin: "",
//     priceUSDPerTon: "", // Total price for weight in tons
//     maxSupply: "",
//     image: null,
//   });
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [isMinting, setIsMinting] = useState(false);
//   const [isApproved, setIsApproved] = useState(false);
//   const [isLoading, setIsLoading] = useState(false);

//   // Calculate tons from weight (kg)
//   const weightInKg = Number(form.weight) || 0;
//   const tons = weightInKg / 1000; // Convert kg to tons

//   // Fetch ETH price for display
//   const { data: priceInETH } = useReadContract({
//     contract,
//     method: "function getPriceInETH(uint256) view returns (uint256)",
//     params: [ethers.parseUnits(form.priceUSDPerTon || "0", 18)],
//     queryOptions: { enabled: !!form.priceUSDPerTon && !!contract },
//   });

//   useEffect(() => {
//     if (!contract) {
//       console.error("Contract is undefined in MintingPage");
//       setErrorMessage("Invalid contract configuration");
//       return;
//     }
//     console.log("Contract:", {
//       address: contract.address,
//       chain: contract.chain?.id,
//     });
//   }, [contract]);

//   useEffect(() => {
//     const fetchFormData = async () => {
//       if (!account || !contract || !contract.address) return;

//       setIsLoading(true);
//       try {
//         const data = await readContract({
//           contract,
//           method:
//             "function getUserForm(address) view returns (string, string, string, uint8)",
//           params: [account.address],
//         });
//         console.log("Form data:", data);
//         setIsApproved(Number(data[3]) === 1);
//       } catch (error) {
//         setErrorMessage("Error checking approval: " + error.message);
//         console.error("Form error:", error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFormData();
//   }, [account, contract]);

//   const handleChange = (e) => {
//     const { name, value, files } = e.target;
//     if (name === "materialType") {
//       const selectedMaterial = materialOptions.find((m) => m.type === value);
//       setForm((prev) => ({
//         ...prev,
//         materialType: value,
//         priceUSDPerTon:
//           selectedMaterial && form.weight
//             ? (
//                 selectedMaterial.priceUSDPerTon *
//                 (Number(form.weight) / 1000)
//               ).toString()
//             : "",
//       }));
//     } else if (name === "weight") {
//       const selectedMaterial = materialOptions.find(
//         (m) => m.type === form.materialType
//       );
//       setForm((prev) => ({
//         ...prev,
//         weight: value,
//         priceUSDPerTon:
//           selectedMaterial && value
//             ? (
//                 selectedMaterial.priceUSDPerTon *
//                 (Number(value) / 1000)
//               ).toString()
//             : "",
//       }));
//     } else {
//       setForm((prev) => ({
//         ...prev,
//         [name]: files ? files[0] : value,
//       }));
//     }
//   };

//   const handleMint = async () => {
//     if (!account) {
//       setErrorMessage("Please connect your wallet");
//       return;
//     }
//     if (!isApproved) {
//       setErrorMessage(
//         "Your account is not approved. Please submit a verification form."
//       );
//       return;
//     }
//     const {
//       materialType,
//       weight,
//       purity,
//       origin,
//       priceUSDPerTon,
//       maxSupply,
//       image,
//     } = form;
//     if (
//       !materialType ||
//       !weight ||
//       !purity ||
//       !origin ||
//       !priceUSDPerTon ||
//       !maxSupply ||
//       !image
//     ) {
//       setErrorMessage("Please fill all fields and upload an image");
//       return;
//     }
//     if (
//       image.size > 100_000_000 ||
//       !["image/png", "image/jpeg"].includes(image.type)
//     ) {
//       setErrorMessage("Image must be PNG/JPEG and under 100MB");
//       return;
//     }
//     if (tons <= 0) {
//       setErrorMessage("Weight must be greater than 0 kg");
//       return;
//     }

//     try {
//       setIsMinting(true);
//       const imageURI = await uploadToPinata(image);
//       console.log("Pinata image URI:", imageURI);

//       const transaction = await prepareContractCall({
//         contract,
//         method:
//           "function registerMaterial(string _materialType, string _weight, string _purity, string _origin, uint256 _priceUSDPerTon, uint256 _maxSupply, string _imageURI)",
//         params: [
//           materialType,
//           `${weight} kg`, // Store weight as kg in contract
//           purity,
//           origin,
//           ethers.parseUnits(priceUSDPerTon, 18),
//           BigInt(maxSupply),
//           imageURI,
//         ],
//       });

//       await sendTransaction(transaction, {
//         onSuccess: (result) => {
//           console.log("Material registered:", result.transactionHash);
//           setSuccessMessage(
//             `Material registered successfully! Tx: ${result.transactionHash.slice(
//               0,
//               6
//             )}...`
//           );
//           setForm({
//             materialType: "",
//             weight: "",
//             purity: "",
//             origin: "",
//             priceUSDPerTon: "",
//             maxSupply: "",
//             image: null,
//           });
//         },
//         onError: (error) => {
//           throw error;
//         },
//       });
//     } catch (error) {
//       setErrorMessage(
//         "Error registering material: " + (error.reason || error.message)
//       );
//       console.error("Mint error:", error);
//     } finally {
//       setIsMinting(false);
//     }
//   };

//   if (!contract || isLoading) {
//     return (
//       <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-center text-white">
//         <p>{!contract ? "Invalid contract configuration" : "Loading..."}</p>
//       </div>
//     );
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-gray-200"
//     >
//       <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">
//         Register Material
//       </h2>
//       {successMessage && (
//         <p className="text-green-500 mb-4 text-center text-sm sm:text-base">
//           {successMessage}
//         </p>
//       )}
//       {errorMessage && (
//         <p className="text-red-500 mb-4 text-center text-sm sm:text-base">
//           {errorMessage}
//         </p>
//       )}

//       {!isApproved ? (
//         <p className="text-red-500 text-center text-sm sm:text-base">
//           You must be approved to register materials. Submit a verification
//           form.
//         </p>
//       ) : (
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Material Type
//             </label>
//             <select
//               name="materialType"
//               value={form.materialType}
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//             >
//               <option value="">Select Material</option>
//               {materialOptions.map((option) => (
//                 <option key={option.type} value={option.type}>
//                   {option.type} (${option.priceUSDPerTon}/ton)
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Weight (kg)
//             </label>
//             <input
//               type="number"
//               name="weight"
//               placeholder="Weight in kg (e.g., 2000)"
//               value={form.weight}
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//             />
//           </div>
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Purity
//             </label>
//             <input
//               type="text"
//               name="purity"
//               placeholder="Purity (e.g., 99%)"
//               value={form.purity}
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//             />
//           </div>
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Origin
//             </label>
//             <input
//               type="text"
//               name="origin"
//               placeholder="Origin (e.g., USA)"
//               value={form.origin}
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//             />
//           </div>
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Total Price (USD for {tons.toFixed(3)} tons)
//             </label>
//             <input
//               type="number"
//               name="priceUSDPerTon"
//               placeholder="Total Price (USD)"
//               value={form.priceUSDPerTon}
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//             />
//             {form.priceUSDPerTon && (
//               <div className="text-sm text-gray-400 mt-1">
//                 <p>~{form.priceUSDPerTon} USDT</p>
//                 {priceInETH && <p>~{ethers.formatEther(priceInETH)} ETH</p>}
//               </div>
//             )}
//           </div>
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Max Supply
//             </label>
//             <input
//               type="number"
//               name="maxSupply"
//               placeholder="Max Supply (e.g., 100)"
//               value={form.maxSupply}
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
//             />
//           </div>
//           <div>
//             <label className="block text-sm sm:text-base text-gray-400">
//               Image
//             </label>
//             <input
//               type="file"
//               name="image"
//               accept="image/png,image/jpeg"
//               onChange={handleChange}
//               disabled={isMinting}
//               className="w-full p-3 bg-gray-800 text-white rounded-lg text-sm sm:text-base"
//             />
//           </div>
//           <button
//             onClick={handleMint}
//             disabled={isMinting}
//             className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center text-sm sm:text-base"
//           >
//             {isMinting ? (
//               <FaSpinner className="animate-spin mr-2" />
//             ) : (
//               "Register Material"
//             )}
//           </button>
//         </div>
//       )}
//     </motion.div>
//   );
// };

// export default MintingPage;


// src/components/MintingPage.jsx
import { useState, useEffect } from "react";
import { useActiveAccount, useSendTransaction, useReadContract } from "thirdweb/react";
import { prepareContractCall, readContract } from "thirdweb";
import { ethers } from "ethers";
import axios from "axios";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";

const uploadToPinata = async (file) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Pinata API key or secret is not defined");
  }

  console.log("Pinata API Key:", apiKey);
  try {
    const response = await axios.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        pinata_api_key: apiKey,
        pinata_secret_api_key: secretKey,
      },
    });
    return `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`;
  } catch (error) {
    console.error("Pinata upload error:", error.response || error);
    throw new Error(
      "Pinata upload failed: " + (error.response?.data?.error || error.message)
    );
  }
};

const materialOptions = [
  { type: "Steel", priceUSDPerTon: 500 }, // Placeholder prices
  { type: "Aluminum", priceUSDPerTon: 2000 },
  { type: "Copper", priceUSDPerTon: 8000 },
];

const MintingPage = ({ contract }) => {
  const account = useActiveAccount();
  const { mutate: sendTransaction } = useSendTransaction();
  const [form, setForm] = useState({
    materialType: "",
    weight: "", // In kg
    purity: "",
    origin: "",
    priceUSDPerTon: "", // Total price for weight in tons
    maxSupply: "",
    image: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate tons from weight (kg)
  const weightInKg = Number(form.weight) || 0;
  const tons = weightInKg / 1000; // Convert kg to tons

  // Fetch ETH price from contract
  const { data: priceInETH, error: priceError } = useReadContract({
    contract,
    method: "function getPriceInETH(uint256) view returns (uint256)",
    params: [ethers.parseUnits(form.priceUSDPerTon || "0", 18)],
    queryOptions: { enabled: !!form.priceUSDPerTon && !!contract },
  });

  // Fallback ETH price calculation (assuming $2000/ETH if Chainlink fails)
  const fallbackETHPrice = (priceUSD) => {
    const ethUSD = 2000; // Fallback ETH/USD price
    return (priceUSD * 1e18) / ethUSD; // Convert to wei
  };

  // Display ETH price
  const displayETHPrice = priceInETH && !priceError && priceInETH <= ethers.parseEther("1000") // Cap to avoid absurd values
    ? ethers.formatEther(priceInETH)
    : ethers.formatEther(fallbackETHPrice(Number(form.priceUSDPerTon || 0)));

  useEffect(() => {
    if (!contract) {
      console.error("Contract is undefined in MintingPage");
      setErrorMessage("Invalid contract configuration");
      return;
    }
    console.log("Contract:", {
      address: contract.address,
      chain: contract.chain?.id,
    });
  }, [contract]);

  useEffect(() => {
    const fetchFormData = async () => {
      if (!account || !contract || !contract.address) return;

      setIsLoading(true);
      try {
        const data = await readContract({
          contract,
          method: "function getUserForm(address) view returns (string, string, string, uint8)",
          params: [account.address],
        });
        console.log("Form data:", data);
        setIsApproved(Number(data[3]) === 1);
      } catch (error) {
        setErrorMessage("Error checking approval: " + error.message);
        console.error("Form error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormData();
  }, [account, contract]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "materialType") {
      const selectedMaterial = materialOptions.find((m) => m.type === value);
      setForm((prev) => ({
        ...prev,
        materialType: value,
        priceUSDPerTon: selectedMaterial && form.weight
          ? (selectedMaterial.priceUSDPerTon * (Number(form.weight) / 1000)).toString()
          : "",
      }));
    } else if (name === "weight") {
      const selectedMaterial = materialOptions.find((m) => m.type === form.materialType);
      setForm((prev) => ({
        ...prev,
        weight: value,
        priceUSDPerTon: selectedMaterial && value
          ? (selectedMaterial.priceUSDPerTon * (Number(value) / 1000)).toString()
          : "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: files ? files[0] : value,
      }));
    }
  };

  const handleMint = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }
    if (!isApproved) {
      setErrorMessage(
        "Your account is not approved. Please submit a verification form."
      );
      return;
    }
    const { materialType, weight, purity, origin, priceUSDPerTon, maxSupply, image } = form;
    if (!materialType || !weight || !purity || !origin || !priceUSDPerTon || !maxSupply || !image) {
      setErrorMessage("Please fill all fields and upload an image");
      return;
    }
    if (image.size > 100_000_000 || !["image/png", "image/jpeg"].includes(image.type)) {
      setErrorMessage("Image must be PNG/JPEG and under 100MB");
      return;
    }
    if (tons <= 0) {
      setErrorMessage("Weight must be greater than 0 kg");
      return;
    }

    try {
      setIsMinting(true);
      const imageURI = await uploadToPinata(image);
      console.log("Pinata image URI:", imageURI);

      const transaction = await prepareContractCall({
        contract,
        method:
          "function registerMaterial(string _materialType, string _weight, string _purity, string _origin, uint256 _priceUSDPerTon, uint256 _maxSupply, string _imageURI)",
        params: [
          materialType,
          `${weight} kg`,
          purity,
          origin,
          ethers.parseUnits(priceUSDPerTon, 18),
          BigInt(maxSupply),
          imageURI,
        ],
      });

      await sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("Material registered:", result.transactionHash);
          setSuccessMessage(`Material registered successfully! Tx: ${result.transactionHash.slice(0, 6)}...`);
          setForm({
            materialType: "",
            weight: "",
            purity: "",
            origin: "",
            priceUSDPerTon: "",
            maxSupply: "",
            image: null,
          });
        },
        onError: (error) => {
          throw error;
        },
      });
    } catch (error) {
      setErrorMessage("Error registering material: " + (error.reason || error.message));
      console.error("Mint error:", error);
    } finally {
      setIsMinting(false);
    }
  };

  if (!contract || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-center text-white">
        <p>{!contract ? "Invalid contract configuration" : "Loading..."}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-gray-900 rounded-lg shadow-lg text-gray-200"
    >
      <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">Register Material</h2>
      {successMessage && (
        <p className="text-green-500 mb-4 text-center text-sm sm:text-base">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-500 mb-4 text-center text-sm sm:text-base">{errorMessage}</p>
      )}

      {!isApproved ? (
        <p className="text-red-500 text-center text-sm sm:text-base">
          You must be approved to register materials. Submit a verification form.
        </p>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="block text-sm sm:text-base text-gray-400">Material Type</label>
            <select
              name="materialType"
              value={form.materialType}
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            >
              <option value="">Select Material</option>
              {materialOptions.map((option) => (
                <option key={option.type} value={option.type}>
                  {option.type} (${option.priceUSDPerTon}/ton)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-400">Weight (kg)</label>
            <input
              type="number"
              name="weight"
              placeholder="Weight in kg (e.g., 2000)"
              value={form.weight}
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-400">Purity</label>
            <input
              type="text"
              name="purity"
              placeholder="Purity (e.g., 99%)"
              value={form.purity}
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-400">Origin</label>
            <input
              type="text"
              name="origin"
              placeholder="Origin (e.g., USA)"
              value={form.origin}
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-400">
              Total Price (USD for {tons.toFixed(3)} tons)
            </label>
            <input
              type="number"
              name="priceUSDPerTon"
              placeholder="Total Price (USD)"
              value={form.priceUSDPerTon}
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
            {form.priceUSDPerTon && (
              <div className="text-sm text-gray-400 mt-1">
                <p>~{form.priceUSDPerTon} USDT</p>
                <p>~{displayETHPrice} ETH</p>
                {priceError && (
                  <p className="text-yellow-500">Using fallback ETH price due to Chainlink error</p>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-400">Max Supply</label>
            <input
              type="number"
              name="maxSupply"
              placeholder="Max Supply (e.g., 100)"
              value={form.maxSupply}
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
            />
          </div>
          <div>
            <label className="block text-sm sm:text-base text-gray-400">Image</label>
            <input
              type="file"
              name="image"
              accept="image/png,image/jpeg"
              onChange={handleChange}
              disabled={isMinting}
              className="w-full p-3 bg-gray-800 text-white rounded-lg text-sm sm:text-base"
            />
          </div>
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center text-sm sm:text-base"
          >
            {isMinting ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              "Register Material"
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MintingPage;