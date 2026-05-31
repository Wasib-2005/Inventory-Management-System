import { RiAccountBox2Line } from "react-icons/ri";
import { commonComponentBG } from "../../../Theme/commonComponentBG";
import { PALETTE } from "../../../Theme/palette";
import { useEffect, useState } from "react";
import axios from "axios";

const AccountsList = () => {
  // Initialized as an array assuming your API returns a list of accounts
  const [accounts, setAccounts] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Correct way: Define the async function inside the effect
    const fetchAccounts = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BACKEND_API_HEADER}/api/accounts-and-permissions`
        );
        
        // axios wraps the response payload in a '.data' property
        // Adjust this if your backend wraps it further (e.g., response.data.accounts)
        setAccounts(response.data || []); 
      } catch (err) {
        console.error("Failed to fetch accounts:", err);
        setError("Failed to load accounts.");
      } finally {
        setLoading(false);
      }
    };

    fetchAccounts();
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className={`h-[89vh] p-3 ${commonComponentBG}`}>
      <h1 className="flex gap-2 items-center text-2xl font-bold mb-4">
        <RiAccountBox2Line size={29} />
        <span>Accounts</span>
      </h1>
      
      <div
        className="w-full h-full rounded-lg shadow p-4 overflow-y-auto"
        style={{ background: PALETTE.bg }}
      >
        {loading && <p className="text-gray-500">Loading accounts...</p>}
        
        {error && <p className="text-red-500">{error}</p>}
        
        {!loading && !error && accounts.length === 0 && (
          <p className="text-gray-500">No accounts found.</p>
        )}

        {!loading && !error && accounts.length > 0 && (
          <ul className="space-y-2">
            {accounts.map((account) => (
              <li 
                key={account.id || account._id} 
                className="p-3 bg-white/5 rounded border border-white/10 flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{account.firstName || "Unnamed Account"}</p>
                  <p className="text-sm text-gray-400">{account.email}</p>
                </div>
                <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                  {account.role || "User"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AccountsList;