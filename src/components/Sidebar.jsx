import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaChartPie,
  FaPlusCircle,
  FaRoad,
  FaWallet,
  FaThLarge,
  FaHistory,
  FaCog,
  FaChartLine,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const marketButtons = [
  { icon: <FaChartPie />, label: "Dashboard", path: "/" },
  { icon: <FaPlusCircle />, label: "Mint Token", path: "/mint-token" },
  {
    icon: <FaRoad />,
    label: "Track Supply Chain",
    path: "/track-supply-chain",
  },
];

const accountButtons = [
  { icon: <FaWallet />, label: "Wallet", path: "/wallet" },
  { icon: <FaThLarge />, label: "My Tokens", path: "/my-tokens" },
  { icon: <FaHistory />, label: "Transfer History", path: "/transfer-history" },
  { icon: <FaCog />, label: "Settings", path: "/settings" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => document.body.classList.remove("overflow-hidden");
  }, [isOpen]);

  return (
    <>
      {/* Mobile Toggle Button */}

      {/* Sidebar */}
      <main
        className={`bg-gray-800 text-gray-400 fixed top-0 left-0 h-screen z-40 transition-all duration-300 ${
          isOpen ? "w-64" : "w-16"
        } md:w-64 md:static`}
      >
        <section className="flex gap-2 p-4">
          <h1
            className={`ml-10 uppercase font-bold text-[20px] text-blue-400 transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            } md:block`}
          >
            MaterialsTrace
          </h1>
          <button
            className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 text-white p-2 rounded"
            onClick={toggleSidebar}
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </section>
        <section className="flex flex-col gap-3 mt-10 p-2 md:p-4">
          <h1
            className={`font-bold text-xl transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            } md:block`}
          >
            Marketplace
          </h1>
          <main className="flex flex-col gap-2">
            {marketButtons.map(({ icon, label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded transition duration-200 ${
                    isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700"
                  } ${!isOpen && "justify-center"} md:gap-4 md:p-2`
                }
                onClick={() => setIsOpen(false)} // Close on click for mobile
              >
                <span className="text-2xl">{icon}</span>
                <span
                  className={`transition-all duration-300 ${
                    isOpen ? "block" : "hidden"
                  } md:block`}
                >
                  {label}
                </span>
              </NavLink>
            ))}
          </main>
        </section>
        <section className="flex flex-col gap-3 mt-10 p-2 md:p-4">
          <h1
            className={`font-bold text-xl transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            } md:block`}
          >
            Account
          </h1>
          <main className="flex flex-col gap-2">
            {accountButtons.map(({ icon, label, path }) => (
              <NavLink
                key={label}
                to={path}
                className={({ isActive }) =>
                  `flex items-center gap-2 p-2 rounded transition duration-200 ${
                    isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700"
                  } ${!isOpen && "justify-center"} md:gap-4 md:p-2`
                }
                onClick={() => setIsOpen(false)} // Close on click for mobile
              >
                <span className="text-2xl">{icon}</span>
                <span
                  className={`transition-all duration-300 ${
                    isOpen ? "block" : "hidden"
                  } md:block`}
                >
                  {label}
                </span>
              </NavLink>
            ))}
          </main>
        </section>
        <section className="flex flex-col gap-3 mt-10 p-2 md:p-4">
          <h1
            className={`font-bold text-xl transition-all duration-300 ${
              isOpen ? "block" : "hidden"
            } md:block`}
          >
            Data
          </h1>
          <button
            className={`flex items-center gap-2 p-2 rounded transition duration-200 hover:bg-gray-700 ${
              !isOpen && "justify-center"
            } md:gap-4 md:p-2`}
          >
            <span className="text-2xl">
              <FaChartLine />
            </span>
            <span
              className={`transition-all duration-300 ${
                isOpen ? "block" : "hidden"
              } md:block`}
            >
              Steel Price: $500/ton
            </span>
          </button>
        </section>
      </main>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
