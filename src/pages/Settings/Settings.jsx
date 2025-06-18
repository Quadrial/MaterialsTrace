import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import { FaMoon, FaSun, FaBell } from "react-icons/fa";

const Settings = () => {
  const [network, setNetwork] = useState("Unknown");
  const [theme, setTheme] = useState("dark");
  const [notifications, setNotifications] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNetwork = async () => {
      if (!window.ethereum) {
        setNetwork("Not Connected");
        return;
      }
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetwork(network.name || network.chainId.toString());
      } catch (error) {
        console.error(error);
      }
    };
    fetchNetwork();
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
    document.body.className = theme === "dark" ? "light" : "dark"; // Simple theme switch
  };

  const toggleNotifications = () => setNotifications((prev) => !prev);

  return (
    <div className="p-4 bg-gray-900 text-gray-200 min-h-screen md:ml-">
      <h1 className="text-3xl font-bold text-blue-400 mb-6">Settings</h1>
      <div className="space-y-6">
        {/* Network Info */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2">Network</h2>
          <p className="text-gray-400">Connected Network: {network}</p>
          <button
            onClick={() => window.ethereum.request({ method: "wallet_addEthereumChain" })}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Switch Network
          </button>
        </div>

        {/* Theme Toggle */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            Theme <span>{theme === "dark" ? <FaMoon /> : <FaSun />}</span>
          </h2>
          <button
            onClick={toggleTheme}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Switch to {theme === "dark" ? "Light" : "Dark"} Mode
          </button>
        </div>

        {/* Notifications */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
            Notifications <FaBell />
          </h2>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={notifications}
              onChange={toggleNotifications}
              className="w-5 h-5 text-blue-600 bg-gray-700 rounded"
            />
            <span>Enable Notifications</span>
          </label>
        </div>
      </div>
    </div>
  );
};

export default Settings;