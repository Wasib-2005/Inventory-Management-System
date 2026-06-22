import { useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";
import { refresh_auth } from "../../Service/auth/auth";
import ms from "ms";

const UserContextProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [waitForUser, setWaitForUser] = useState(true);
  const hasFetched                    = useRef(false);

  // 1. Parse TTL from .env. Fallback to 15 minutes if missing.
  const accessTTLStr = import.meta.env.VITE_JWT_ACCESS_TTL || "15m";
  const accessTTLMs  = ms(accessTTLStr);

  // Refresh buffer: refresh 1 minute BEFORE the token actually expires to prevent requests from failing
  const REFRESH_BUFFER = 60 * 1000; 
  const refreshIntervalMs = Math.max(accessTTLMs - REFRESH_BUFFER, 10000); // Ensure it's at least 10 seconds

  const refreshUser = async () => {
    try {
      const data = await refresh_auth();
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setWaitForUser(false);
    }
  };

  // Initial fetch on mount
  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    refreshUser();
  }, []);

  // 2. Set up the background interval timer to refresh every dynamic .env period
  useEffect(() => {
    // Only start interval if a user is logged in
    if (!user) return;

    console.log(`Token refresh scheduled every ${refreshIntervalMs / 1000} seconds.`);

    const interval = setInterval(() => {
      console.log("Automatically refreshing access token...");
      refreshUser();
    }, refreshIntervalMs);

    // Clean up interval if user logs out or leaves the page
    return () => clearInterval(interval);
  }, [user, refreshIntervalMs]);

  return (
    <UserContext.Provider value={{ user, setUser, waitForUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;