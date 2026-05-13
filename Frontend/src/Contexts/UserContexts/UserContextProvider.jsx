import { useEffect, useRef, useState } from "react";
import { UserContext } from "./UserContext";
import { refresh_auth } from "../../Service/auth/auth";

const UserContextProvider = ({ children }) => {
  const [user, setUser]               = useState(null);
  const [waitForUser, setWaitForUser] = useState(true);
  const hasFetched                    = useRef(false);

  const refreshUser = async () => {
    try {
      const data = await refresh_auth();
      console.log(data.user)
      setUser(data.user ?? null);
    } catch {
      setUser(null);
    } finally {
      setWaitForUser(false);
    }
  };

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    refreshUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, waitForUser, refreshUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;