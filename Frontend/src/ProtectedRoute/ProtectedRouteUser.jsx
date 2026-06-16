import { useContext } from "react";
import { Navigate } from "react-router"; // Changed from useNavigate
import { UserContext } from "../Contexts/UserContexts/UserContext";
import { PALETTE } from "../Theme/palette";
import { commonComponentBG } from "../Theme/commonComponentBG";

const ProtectedRouteUser = ({ children }) => {
  const { user, waitForUser } = useContext(UserContext);

  console.log(user, waitForUser);

  // 1. While waiting for user data, show the skeleton placeholder
  if (waitForUser) {
    return (
      <div className="">
        {/* Sidebar Skeleton */}
        <nav
          className="fixed md:left-5 h-full md:h-[calc(100vh-40px)] top-5 z-50 p-2 md:rounded-l-2xl"
          style={{
            width: 78,
            backgroundColor: PALETTE.bg,
            boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
          }}
        >
          <div className="h-full flex flex-col py-5 bg-gray-300/60 md:rounded-l-xl animate-pulse" />
        </nav>

        {/* Main Content Skeleton */}
        <div className="md:ml-[98px] ml-[78px] md:pt-5 h-full md:h-[calc(100vh-20px)] flex flex-col">
          <div
            className="flex-1 min-h-0 ml-2 md:mr-5 p-2 md:rounded-r-2xl flex flex-col"
            style={{
              backgroundColor: PALETTE.bg,
              borderRight: `1px solid ${PALETTE.steel}`,
              boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
            }}
          >
            <div className="flex-1 min-h-0 flex flex-col px-1 md:px-3 py-2 md:py-4 bg-gray-300/60 overflow-hidden animate-pulse">
              <div className={`w-full ${commonComponentBG("r")} h-full bg-gray-300/50 animate-pulse`} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. If loading is done but no user exists, redirect safely using <Navigate />
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // 3. If authenticated, render the actual component passed inside
  return children;
};

export default ProtectedRouteUser;