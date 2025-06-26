// src/components/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaPlusCircle, FaRoad, FaCamera } from "react-icons/fa";
import { ethers } from "ethers";
import { NavLink } from "react-router-dom";
import { createWallet, inAppWallet } from "thirdweb/wallets";
import { ConnectButton } from "thirdweb/react";
import {
  useActiveAccount,
  useReadContract,
  useSendTransaction,
} from "thirdweb/react";
import { prepareContractCall } from "thirdweb";
import { client } from "../../client";
import { sepolia } from "thirdweb/chains";

const MaterialCard = ({
  contract,
  materialId,
  account,
  isBuying,
  setIsBuying,
  setSuccessMessage,
  setErrorMessage,
  setMaterials,
}) => {
  const { data, isPending, error } = useReadContract({
    contract,
    method:
      "function materials(uint256 _index) view returns (uint256 materialId, address seller, string materialType, string weight, string purity, string origin, uint256 priceUSDPerTon, uint256 maxSupply, uint256 mintedSupply, string imageURI, bool isAvailable)",
    params: [BigInt(materialId)],
    queryOptions: { enabled: !!contract && materialId > 0 },
  });

  const { data: priceInETH, error: priceError } = useReadContract({
    contract,
    method: "function getPriceInETH(uint256) view returns (uint256)",
    params: [data ? data[6] : BigInt(0)], // priceUSDPerTon
    queryOptions: { enabled: !!data && !!contract && data[6] > 0 },
  });

  // Fallback ETH price calculation (assuming $2000/ETH)
  const fallbackETHPrice = (priceUSD) => {
    const ethUSD = 2000; // Fallback ETH/USD price
    // Ensure priceUSD is a number and not negative
    const safePriceUSD = isNaN(priceUSD) || priceUSD < 0 ? 0 : priceUSD;
    return BigInt(Math.floor((safePriceUSD * 1e18) / ethUSD)); // Convert to wei
  };

  const { mutate: sendTransaction } = useSendTransaction();

  const handleBuy = async (materialId, priceUSDPerTon) => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setIsBuying((prev) => ({ ...prev, [materialId]: true }));
      console.log("Preparing buyMaterial:", {
        materialId,
        priceUSDPerTon: ethers.formatUnits(priceUSDPerTon, 18),
        account: account.address,
      });

      // Get ETH price
      const requiredValue =
        priceInETH && !priceError && priceInETH <= ethers.parseEther("1000")
          ? BigInt(priceInETH)
          : fallbackETHPrice(Number(ethers.formatUnits(priceUSDPerTon, 18)));

      console.log("Dynamic price:", ethers.formatEther(requiredValue), "ETH");

      // Check wallet balance
      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(account.address);
      console.log(
        "Wallet balance:",
        ethers.formatEther(balance),
        "ETH",
        "Required:",
        ethers.formatEther(requiredValue),
        "ETH"
      );

      if (balance < requiredValue) {
        throw new Error("Insufficient ETH balance for purchase");
      }

      const transaction = await prepareContractCall({
        contract,
        method: "function buyMaterial(uint256 _tokenId) payable",
        params: [BigInt(materialId)],
        value: requiredValue,
        gas: 200000,
      });

      console.log("Sending buyMaterial transaction:", transaction);
      await sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("buyMaterial successful:", result.transactionHash);
          setSuccessMessage(
            `Material purchased! Tx: ${result.transactionHash.slice(0, 6)}...`
          );
          setMaterials((prev) =>
            prev.map((m) =>
              m.materialId === materialId ? { ...m, isAvailable: false } : m
            )
          );
        },
        onError: (err) => {
          throw err;
        },
      });
    } catch (err) {
      console.error("Purchase error:", err);
      setErrorMessage(
        "Error purchasing material: " + (err.reason || err.message)
      );
    } finally {
      setIsBuying((prev) => ({ ...prev, [materialId]: false }));
    }
  };

  if (isPending || !data) return null;
  if (error) {
    console.error(`Error fetching material ${materialId}:`, error);
    return null;
  }
  if (!data[10]) return null; // Skip unavailable materials

  const material = {
    materialId: Number(data[0]),
    seller: data[1],
    materialType: data[2],
    weight: data[3],
    purity: data[4],
    origin: data[5],
    priceUSDPerTon: Number(ethers.formatUnits(data[6], 18)),
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
      return ethers.formatEther(fallbackETHPrice(material.priceUSDPerTon));
    } catch (err) {
      console.error(
        `Error formatting ETH price for material ${materialId}:`,
        err
      );
      return "N/A";
    }
  })();

  console.log(`Material ${materialId}:`, material);

  return (
    <motion.div
      key={materialId}
      whileHover={{ scale: 1.05 }}
      className="p-4 bg-gray-800 rounded-lg shadow-md flex flex-col"
    >
      <img
        src={material.imageURI}
        alt={material.materialType}
        className="w-full h-40 sm:h-48 object-cover rounded-lg mb-3"
      />
      <h3 className="text-base sm:text-lg font-semibold text-white truncate">
        {material.materialType}
      </h3>
      <div className="text-sm sm:text-base text-gray-300 space-y-1 flex-grow">
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
        <p>
          <strong>Material ID:</strong> {material.materialId}
        </p>
      </div>
      <button
        onClick={() => handleBuy(material.materialId, data[6])}
        disabled={
          isBuying[material.materialId] ||
          material.seller.toLowerCase() === account?.address?.toLowerCase()
        }
        className="w-full mt-3 py-2 text-sm sm:text-base font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
      >
        {isBuying[material.materialId] ? "Buying..." : "Buy Now"}
      </button>
    </motion.div>
  );
};

const Dashboard = ({ contract }) => {
  const account = useActiveAccount();
  const [materials, setMaterials] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isBuying, setIsBuying] = useState({});
  const [newOwnerAddress, setNewOwnerAddress] = useState("");
  const { mutate: sendTransaction } = useSendTransaction();

  const { data: materialCounter, error: counterError } = useReadContract({
    contract,
    method: "function materialCounter() view returns (uint256)",
    queryOptions: { enabled: !!contract },
  });

  const { data: owner, error: ownerError } = useReadContract({
    contract,
    method: "function owner() view returns (address)",
    queryOptions: { enabled: !!contract },
  });

  useEffect(() => {
    if (counterError) {
      setErrorMessage(
        "Error fetching material counter: " + counterError.message
      );
    }
    if (ownerError) {
      setErrorMessage("Error fetching contract owner: " + ownerError.message);
    }
  }, [counterError, ownerError]);

  const handleRenounceOwnership = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }
    if (account.address.toLowerCase() !== owner?.toLowerCase()) {
      setErrorMessage("Only the contract owner can renounce ownership");
      return;
    }

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function renounceOwnership()",
        params: [],
      });

      console.log("Sending renounceOwnership transaction:", transaction);
      await sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("renounceOwnership successful:", result.transactionHash);
          setSuccessMessage(
            `Ownership renounced! Tx: ${result.transactionHash.slice(0, 6)}...`
          );
        },
        onError: (err) => {
          throw err;
        },
      });
    } catch (err) {
      console.error("Renounce ownership error:", err);
      setErrorMessage(
        "Error renouncing ownership: " + (err.reason || err.message)
      );
    }
  };

  const handleTransferOwnership = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }
    if (account.address.toLowerCase() !== owner?.toLowerCase()) {
      setErrorMessage("Only the contract owner can transfer ownership");
      return;
    }
    if (!ethers.isAddress(newOwnerAddress)) {
      setErrorMessage("Invalid new owner address");
      return;
    }

    try {
      const transaction = await prepareContractCall({
        contract,
        method: "function transferOwnership(address newOwner)",
        params: [newOwnerAddress],
      });

      console.log("Sending transferOwnership transaction:", transaction);
      await sendTransaction(transaction, {
        onSuccess: (result) => {
          console.log("transferOwnership successful:", result.transactionHash);
          setSuccessMessage(
            `Ownership transferred! Tx: ${result.transactionHash.slice(
              0,
              6
            )}...`
          );
        },
        onError: (err) => {
          throw err;
        },
      });
    } catch (err) {
      console.error("Transfer ownership error:", err);
      setErrorMessage(
        "Error transferring ownership: " + (err.reason || err.message)
      );
    }
  };

  const recommendedWallets = [
    createWallet("io.metamask"),
    createWallet("phantom"),
  ];
  const wallets = [
    inAppWallet({ auth: { options: ["google", "apple", "x", "email"] } }),
    createWallet("io.metamask"),
    createWallet("app.phantom"),
    createWallet("io.coinbase"),
    createWallet("app.backpack"),
  ];

  return (
    <div className="p-4 text-gray-200 min-h-screen bg-gray-900">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 sticky top-0 bg-gray-900 p-4 rounded-lg shadow-lg z-10">
        <h1 className="text-xl md:text-3xl font-bold text-blue-400">
          Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <ConnectButton
            client={client}
            chain={sepolia}
            wallets={wallets}
            recommendedWallets={recommendedWallets}
            connectModal={{
              size: "wide",
              title: "Welcome to SnapLens",
              titleIcon: (
                <div className="bg-green-100 p-2 rounded-full inline-block">
                  <FaCamera className="text-green-600" />
                </div>
              ),
              description: "Choose your preferred login method to continue",
              showThirdwebBranding: false,
            }}
            connectButton={{
              label: (
                <span className="flex items-center justify-center gap-2">
                  <span className="hidden sm:inline">Connect Wallet</span>
                  <span className="sm:hidden">Connect</span>
                </span>
              ),
              className:
                "w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg",
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-5 items-center mb-6 sticky top-20 bg-gray-900 p-4 rounded-lg shadow-lg z-10">
        <NavLink to="/mint-page">
          <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm sm:text-base">
            <FaPlusCircle /> Mint New Token
          </button>
        </NavLink>
        <NavLink to="/track-supply-chain">
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm sm:text-base">
            <FaRoad /> Track Supply Chain
          </button>
        </NavLink>
      </div>

      {/* Material Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 bg-gray-900 rounded-lg shadow-lg"
      >
        {successMessage && (
          <p className="text-green-500 mb-4 text-center text-sm sm:text-base">
            {successMessage}
          </p>
        )}
        {errorMessage && (
          <p className="text-red-500 mb-4 text-center text-sm sm:text-base">
            {errorMessage}
          </p>
        )}
        {account && account.address.toLowerCase() === owner?.toLowerCase() && (
          <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRenounceOwnership}
              className="w-full sm:w-auto py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm sm:text-base transition-colors duration-200"
            >
              Renounce Ownership
            </button>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newOwnerAddress}
                onChange={(e) => setNewOwnerAddress(e.target.value)}
                placeholder="New owner address"
                className="w-full sm:w-64 py-2 px-3 bg-gray-800 text-white rounded-lg text-sm sm:text-base"
              />
              <button
                onClick={handleTransferOwnership}
                className="w-full sm:w-auto py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm sm:text-base transition-colors duration-200"
              >
                Transfer Ownership
              </button>
            </div>
          </div>
        )}
        {!materialCounter || Number(materialCounter) === 0 ? (
          <p className="text-gray-400 text-center text-sm sm:text-base">
            No materials available.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {Array.from(
              { length: Number(materialCounter) },
              (_, i) => i + 1
            ).map((materialId) => (
              <MaterialCard
                key={materialId}
                contract={contract}
                materialId={materialId}
                account={account}
                isBuying={isBuying}
                setIsBuying={setIsBuying}
                setSuccessMessage={setSuccessMessage}
                setErrorMessage={setErrorMessage}
                setMaterials={setMaterials}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Timeline/Stats Section */}
      <div className="mt-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 text-white">
          Supply Chain Overview
        </h2>
        <motion.div
          className="flex overflow-x-auto space-x-4 p-2 bg-gray-800 rounded-lg"
          initial={{ x: 100 }}
          animate={{ x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-2 bg-gray-700 rounded text-white text-sm sm:text-base">
            Mined
          </div>
          <div className="p-2 bg-gray-700 rounded text-white text-sm sm:text-base">
            Processed
          </div>
          <div className="p-2 bg-gray-700 rounded text-white text-sm sm:text-base">
            Delivered
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
