// src/components/MintingPage.jsx
import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { ethers } from "ethers";
import axios from "axios";
import { motion } from "framer-motion";
import { FaSpinner } from "react-icons/fa";
import { parseEther } from "ethers";


const uploadToPinata = async (file) => {
  const url = "https://api.pinata.cloud/pinning/pinFileToIPFS";
  const formData = new FormData();
  formData.append("file", file);

  const apiKey = import.meta.env.VITE_PINATA_API_KEY;
  const secretKey = import.meta.env.VITE_PINATA_SECRET_API_KEY;

  if (!apiKey || !secretKey) {
    throw new Error("Pinata API key or secret is not defined");
  }

  console.log("Pinata API Key:", apiKey); // Debug log
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

const MintingPage = ({ contract }) => {
  const account = useActiveAccount();
  const [form, setForm] = useState({
    materialType: "",
    weight: "",
    purity: "",
    origin: "",
    price: "",
    maxSupply: "",
    mintAmount: "",
    image: null,
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isMinting, setIsMinting] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
          method:
            "function getUserForm(address) view returns (string, string, string, uint8)",
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
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
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
    const {
      materialType,
      weight,
      purity,
      origin,
      price,
      maxSupply,
      mintAmount,
      image,
    } = form;
    if (
      !materialType ||
      !weight ||
      !purity ||
      !origin ||
      !price ||
      !maxSupply ||
      !mintAmount ||
      !image
    ) {
      setErrorMessage("Please fill all fields and upload an image");
      return;
    }
    if (
      image.size > 100_000_000 ||
      !["image/png", "image/jpeg"].includes(image.type)
    ) {
      setErrorMessage("Image must be PNG/JPEG and under 100MB");
      return;
    }

    try {
      setIsMinting(true);
      const imageURI = await uploadToPinata(image);
      console.log("Pinata image URI:", imageURI);

      const transaction = await prepareContractCall({
        contract,
        method:
          "function mintMaterial(string, string, string, string, uint256, uint256, string, uint256) returns (uint256[])",
        params: [
          materialType,
          weight,
          purity,
          origin,
          parseEther(price), // ✅ convert to BigInt in wei
          BigInt(maxSupply), // ✅ convert to BigInt
          imageURI,
          BigInt(mintAmount), // ✅ convert to BigInt
        ],
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });
      setSuccessMessage(
        `Material minted successfully! Tx: ${transactionHash.slice(0, 6)}...`
      );
      setForm({
        materialType: "",
        weight: "",
        purity: "",
        origin: "",
        price: "",
        maxSupply: "",
        mintAmount: "",
        image: null,
      });
    } catch (error) {
      setErrorMessage(
        "Error minting material: " + (error.reason || error.message)
      );
      console.error("Mint error:", error);
    } finally {
      setIsMinting(false);
    }
  };

  if (!contract || isLoading) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-whit rounded-lg shadow-lg text-center">
        <p>{!contract ? "Invalid contract configuration" : "Loading..."}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto p-6 bg-whit rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-bold mb-6 text-center">Mint Material</h2>
      {successMessage && (
        <p className="text-green-600 mb-4 text-center">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 mb-4 text-center">{errorMessage}</p>
      )}

      {!isApproved ? (
        <p className="text-red-600 text-center">
          You must be approved to mint materials. Submit a verification form.
        </p>
      ) : (
        <div className="space-y-4">
          <input
            type="text"
            name="materialType"
            placeholder="Material Type (e.g., Steel)"
            value={form.materialType}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="weight"
            placeholder="Weight (e.g., 100kg)"
            value={form.weight}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="purity"
            placeholder="Purity (e.g., 99.9%)"
            value={form.purity}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            name="origin"
            placeholder="Origin (e.g., Sweden)"
            value={form.origin}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="price"
            placeholder="Price in ETH (e.g., 0.1)"
            value={form.price}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="maxSupply"
            placeholder="Max Supply (e.g., 100)"
            value={form.maxSupply}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="number"
            name="mintAmount"
            placeholder="Mint Amount (e.g., 10)"
            value={form.mintAmount}
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="file"
            name="image"
            accept="image/png,image/jpeg"
            onChange={handleChange}
            disabled={isMinting}
            className="w-full p-3 border rounded-lg"
          />
          <button
            onClick={handleMint}
            disabled={isMinting}
            className="w-full py-3 bg-blue-600 text-whit
             rounded-lg hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center"
          >
            {isMinting ? (
              <FaSpinner className="animate-spin mr-2" />
            ) : (
              "Mint Material"
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default MintingPage;
