
// // src/components/VerificationRequest.jsx
// import { useState, useEffect } from "react";
// import { useActiveAccount, useReadContract } from "thirdweb/react";
// import { prepareContractCall, sendTransaction } from "thirdweb";

// const VerificationRequest = ({ contract }) => {
//   const account = useActiveAccount();
//   const [form, setForm] = useState({ name: "", company: "", website: "" });
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [successMessage, setSuccessMessage] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");
//   const [status, setStatus] = useState(null);
//   const [refreshKey, setRefreshKey] = useState(0); // For forcing refetch

//   // Fetch user’s form status
//   const { data: formData, error: formError, refetch: refetchForm, isLoading } = useReadContract({
//     contract,
//     method: "function getMyForm() view returns (string, string, string, uint8)",
//     queryOptions: { enabled: !!account && !!contract },
//     key: [account?.address, refreshKey], // Force refetch on key change
//   });

//   // Process form data
//   useEffect(() => {
//     console.log("Account:", account?.address);
//     console.log("Contract:", contract?.address);
//     console.log("Form Loading:", isLoading);
//     console.log("Form Data:", formData);
//     console.log("Form Error:", formError);

//     if (isLoading) {
//       setErrorMessage("Loading form data...");
//       return;
//     }

//     if (formError) {
//       console.error("Error fetching form status:", formError);
//       setErrorMessage("Error fetching form status: " + (formError.reason || formError.message));
//       setStatus(null);
//       return;
//     }

//     if (formData) {
//       const [name, company, website, statusEnum] = formData;
//       console.log("getMyForm result:", { name, company, website, status: Number(statusEnum) });

//       // Set status even if fields are empty, as long as statusEnum is valid
//       if (statusEnum >= 0) {
//         const formStatus = {
//           name: name || "",
//           company: company || "",
//           website: website || "",
//           status: Number(statusEnum),
//         };
//         setStatus(formStatus);
//         setForm({ name: name || "", company: company || "", website: website || "" });
//       } else {
//         setStatus(null);
//         setForm({ name: "", company: "", website: "" });
//       }
//     }
//   }, [formData, formError, isLoading, account, contract]);

//   // Handle form input changes
//   const handleChange = (e) => {
//     setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   // Submit form
//   const handleSubmit = async () => {
//     if (!account) {
//       setErrorMessage("Please connect your wallet");
//       return;
//     }

//     const { name, company, website } = form;
//     if (!name || !company || !website) {
//       setErrorMessage("Please fill all fields");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       setSuccessMessage("");
//       setErrorMessage("");

//       const transaction = await prepareContractCall({
//         contract,
//         method: "function submitForm(string _name, string _company, string _website)",
//         params: [name, company, website],
//       });

//       const { transactionHash } = await sendTransaction({ transaction, account });
//       if (transactionHash) {
//         setSuccessMessage("Form submitted successfully!");
//         setForm({ name: "", company: "", website: "" });
//         setRefreshKey((prev) => prev + 1);
//         refetchForm();
//       }
//     } catch (error) {
//       console.error("Submit error:", error);
//       setErrorMessage(
//         error.reason === "Form already submitted"
//           ? "You have already submitted a form. Update or withdraw it below."
//           : "Error submitting form: " + (error.reason || error.message)
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Update form
//   const handleUpdate = async () => {
//     if (!account) {
//       setErrorMessage("Please connect your wallet");
//       return;
//     }

//     const { name, company, website } = form;
//     if (!name || !company || !website) {
//       setErrorMessage("Please fill all fields");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       setSuccessMessage("");
//       setErrorMessage("");

//       const transaction = await prepareContractCall({
//         contract,
//         method: "function updateForm(string _name, string _company, string _website)",
//         params: [name, company, website],
//       });

//       const { transactionHash } = await sendTransaction({ transaction, account });
//       if (transactionHash) {
//         setSuccessMessage("Form updated successfully!");
//         setRefreshKey((prev) => prev + 1);
//         refetchForm();
//       }
//     } catch (error) {
//       console.error("Update error:", error);
//       setErrorMessage("Error updating form: " + (error.reason || error.message));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // Withdraw form
//   const handleWithdraw = async () => {
//     if (!account) {
//       setErrorMessage("Please connect your wallet");
//       return;
//     }

//     try {
//       setIsSubmitting(true);
//       setSuccessMessage("");
//       setErrorMessage("");

//       const transaction = await prepareContractCall({
//         contract,
//         method: "function withdrawForm()",
//         params: [],
//       });

//       const { transactionHash } = await sendTransaction({ transaction, account });
//       if (transactionHash) {
//         setSuccessMessage("Form withdrawn successfully!");
//         setForm({ name: "", company: "", website: "" });
//         setStatus(null);
//         setRefreshKey((prev) => prev + 1);
//         refetchForm();
//       }
//     } catch (error) {
//       console.error("Withdraw error:", error);
//       setErrorMessage("Error withdrawing form: " + (error.reason || error.message));
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <div className="max-w-2xl mx-auto p-6 bg-whit rounded-lg shadow-lg">
//       <h2 className="text-2xl font-bold text-center mb-6">User Verification</h2>

//       {successMessage && (
//         <p className="text-green-600 font-semibold mb-4 text-center">{successMessage}</p>
//       )}
//       {errorMessage && (
//         <p className="text-red-600 font-semibold mb-4 text-center">{errorMessage}</p>
//       )}

//       {status && (
//         <div className="mb-6 p-4 bg-gray-500 rounded-lg">
//           <h3 className="text-lg font-semibold mb-2">Your Form Status</h3>
//           <p><strong>Name:</strong> {status.name || "N/A"}</p>
//           <p><strong>Company:</strong> {status.company || "N/A"}</p>
//           <p><strong>Website:</strong> {status.website || "N/A"}</p>
//           <p>
//             <strong>Status:</strong>{" "}
//             {status.status === 0
//               ? "⏳ Pending Review"
//               : status.status === 1
//               ? "✅ Approved"
//               : "❌ Rejected"}
//           </p>
//         </div>
//       )}

//       <div className="space-y-4">
//         <input
//           type="text"
//           name="name"
//           placeholder="Your Name"
//           value={form.name}
//           onChange={handleChange}
//           disabled={isSubmitting}
//           className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
//         />
//         <input
//           type="text"
//           name="company"
//           placeholder="Company"
//           value={form.company}
//           onChange={handleChange}
//           disabled={isSubmitting}
//           className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
//         />
//         <input
//           type="text"
//           name="website"
//           placeholder="Website (e.g., https://example.com)"
//           value={form.website}
//           onChange={handleChange}
//           disabled={isSubmitting}
//           className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
//         />

//         <div className="flex flex-wrap gap-4">
//           {status ? (
//             <>
//               {status.status === 0 ? (
//                 <>
//                   <button
//                     onClick={handleUpdate}
//                     disabled={isSubmitting}
//                     className="flex-1 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 disabled:bg-gray-400 transition-colors"
//                   >
//                     {isSubmitting ? "Updating..." : "Update Form"}
//                   </button>
//                   <button
//                     onClick={handleWithdraw}
//                     disabled={isSubmitting}
//                     className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
//                   >
//                     {isSubmitting ? "Withdrawing..." : "Withdraw Form"}
//                   </button>
//                 </>
//               ) : (
//                 <>
//                   <p className="text-gray-600 flex-1">
//                     Your form is {status.status === 1 ? "approved" : "rejected"}. Withdraw to submit a new one.
//                   </p>
//                   <button
//                     onClick={handleWithdraw}
//                     disabled={isSubmitting}
//                     className="flex-1 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 transition-colors"
//                   >
//                     {isSubmitting ? "Withdrawing..." : "Withdraw Form"}
//                   </button>
//                 </>
//               )}
//             </>
//           ) : (
//             <button
//               onClick={handleSubmit}
//               disabled={isSubmitting}
//               className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
//             >
//               {isSubmitting ? "Submitting..." : "Submit Form"}
//             </button>
//           )}
//         </div>

//         {/* Debug Button to Refetch Form */}
//         <button
//           onClick={() => {
//             setRefreshKey((prev) => prev + 1);
//             refetchForm();
//           }}
//           className="w-full py-2 mt-4 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
//         >
//           Debug: Refetch Form
//         </button>
//       </div>
//     </div>
//   );
// };

// export default VerificationRequest;


// src/components/VerificationRequest.jsx
import { useState, useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";

const VerificationRequest = ({ contract }) => {
  const account = useActiveAccount();
  const [form, setForm] = useState({ name: "", company: "", website: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [refreshKey, setRefreshKey] = useState(Date.now());

  // Fetch user’s form status using userForms
  const { data: formData, error: formError, refetch: refetchForm, isLoading } = useReadContract({
    contract,
    method: "function userForms(address) view returns (string name, string company, string website, uint8 status)",
    params: account ? [account.address] : undefined,
    queryOptions: {
      enabled: !!account && !!contract,
      cache: { cacheTime: 0, staleTime: 0 },
    },
    key: [account?.address, refreshKey],
  });

  // Process form data
  useEffect(() => {
    console.log("=== VerificationRequest Logs ===");
    console.log("Account:", account?.address);
    console.log("Contract:", contract?.address);
    console.log("Form Loading:", isLoading);
    console.log("Form Data:", formData);
    console.log("Form Error:", formError);
    console.log("Status State:", status);
    console.log("Refresh Key:", refreshKey);
    console.log("==============================");

    if (isLoading) {
      setErrorMessage("Loading form data...");
      return;
    }

    if (formError) {
      console.error("Error fetching form status:", formError);
      setErrorMessage("Error fetching form status: " + (formError.reason || formError.message));
      setStatus(null);
      return;
    }

    if (formData) {
      const [name, company, website, statusEnum] = formData;
      const parsedStatus = Number(statusEnum);
      console.log("userForms result:", { name, company, website, status: parsedStatus });

      // Only set status if form exists and status is valid
      if (parsedStatus >= 0 && parsedStatus <= 2 && (name || company || website || parsedStatus > 0)) {
        const formStatus = {
          name: name || "",
          company: company || "",
          website: website || "",
          status: parsedStatus,
        };
        setStatus(formStatus);
        setForm({ name: name || "", company: company || "", website: website || "" });
      } else {
        setStatus(null);
        setForm({ name: "", company: "", website: "" });
        setErrorMessage("No active form found. Submit a new form.");
      }
    } else {
      setStatus(null);
      setForm({ name: "", company: "", website: "" });
      setErrorMessage("No form data found. Submit a new form.");
    }
  }, [formData, formError, isLoading, account, contract, refreshKey]);

  // Handle form input changes
  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit form
  const handleSubmit = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    const { name, company, website } = form;
    if (!name || !company || !website) {
      setErrorMessage("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const transaction = await prepareContractCall({
        contract,
        method: "function submitForm(string _name, string _company, string _website)",
        params: [name, company, website],
      });

      const { transactionHash } = await sendTransaction({ transaction, account });
      if (transactionHash) {
        setSuccessMessage("Form submitted successfully!");
        setForm({ name: "", company: "", website: "" });
        setRefreshKey(Date.now());
        refetchForm();
      }
    } catch (error) {
      console.error("Submit error:", error);
      setErrorMessage(
        error.reason === "Form already submitted"
          ? "You have already submitted a form. Update or withdraw it below."
          : "Error submitting form: " + (error.reason || error.message)
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update form
  const handleUpdate = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    const { name, company, website } = form;
    if (!name || !company || !website) {
      setErrorMessage("Please fill all fields");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const transaction = await prepareContractCall({
        contract,
        method: "function updateForm(string _name, string _company, string _website)",
        params: [name, company, website],
      });

      const { transactionHash } = await sendTransaction({ transaction, account });
      if (transactionHash) {
        setSuccessMessage("Form updated successfully!");
        setRefreshKey(Date.now());
        refetchForm();
      }
    } catch (error) {
      console.error("Update error:", error);
      setErrorMessage("Error updating form: " + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Withdraw form
  const handleWithdraw = async () => {
    if (!account) {
      setErrorMessage("Please connect your wallet");
      return;
    }

    try {
      setIsSubmitting(true);
      setSuccessMessage("");
      setErrorMessage("");

      const transaction = await prepareContractCall({
        contract,
        method: "function withdrawForm()",
        params: [],
      });

      const { transactionHash } = await sendTransaction({ transaction, account });
      if (transactionHash) {
        setSuccessMessage("Form withdrawn successfully!");
        setForm({ name: "", company: "", website: "" });
        setStatus(null);
        setRefreshKey(Date.now());
        refetchForm();
        // Force refetch after a delay to ensure contract state updates
        setTimeout(() => {
          setRefreshKey(Date.now());
          refetchForm();
        }, 2000);
      }
    } catch (error) {
      console.error("Withdraw error:", error);
      setErrorMessage("Error withdrawing form: " + (error.reason || error.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manual contract call for debugging
  const handleManualFetch = async () => {
    if (!account || !contract) {
      setErrorMessage("Wallet or contract not connected");
      return;
    }

    try {
      setErrorMessage("");
      const data = await readContract({
        contract,
        method: "function userForms(address) view returns (string name, string company, string website, uint8 status)",
        params: [account.address],
      });
      console.log("Manual userForms:", data);
      setSuccessMessage("Manual fetch successful. Check console for data.");
    } catch (error) {
      console.error("Manual fetch error:", error);
      setErrorMessage("Manual fetch failed: " + (error.reason || error.message));
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-gray-600 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6">User Verification</h2>

      {successMessage && (
        <p className="text-green-600 font-semibold mb-4 text-center">{successMessage}</p>
      )}
      {errorMessage && (
        <p className="text-red-600 font-semibold mb-4 text-center">{errorMessage}</p>
      )}

      {status && (
        <div className="mb-6 p-4 bg-gray-400 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Your Form Status</h3>
          <p><strong>Name:</strong> {status.name || "N/A"}</p>
          <p><strong>Company:</strong> {status.company || "N/A"}</p>
          <p><strong>Website:</strong> {status.website || "N/A"}</p>
          <p>
            <strong>Status:</strong>{" "}
            {status.status === 0
              ? "⏳ Pending Review"
              : status.status === 1
              ? "✅ Approved"
              : "❌ Rejected"}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Your Name"
          value={form.name}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        />
        <input
          type="text"
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        />
        <input
          type="text"
          name="website"
          placeholder="Website (e.g., https://example.com)"
          value={form.website}
          onChange={handleChange}
          disabled={isSubmitting}
          className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-200"
        />

        <div className="flex flex-wrap gap-4">
          {status ? (
            <>
              {status.status === 0 || status.status === 1 ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isSubmitting ? "Updating..." : "Update Form"}
                  </button>
                  <button
                    onClick={handleWithdraw}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isSubmitting ? "Withdrawing..." : "Withdraw Form"}
                  </button>
                </>
              ) : (
                <>
                  <p className="text-gray-600 flex-1">
                    Your form is {status.status === 1 ? "approved" : "rejected"}. Withdraw to submit a new one.
                  </p>
                  <button
                    onClick={handleWithdraw}
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isSubmitting ? "Withdrawing..." : "Withdraw Form"}
                  </button>
                </>
              )}
            </>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSubmitting ? "Submitting..." : "Submit Form"}
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setRefreshKey(Date.now());
              refetchForm();
            }}
            className="flex-1 py-2 mt-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Refetch Form
          </button>
          <button
            onClick={handleManualFetch}
            className="flex-1 py-2 mt-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Manual Fetch
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationRequest;