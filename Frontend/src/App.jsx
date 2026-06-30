import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";
import Nav from "./Components/Nav/Nav";
import { PALETTE } from "./Theme/palette";
import { useGetName } from "./Hooks/userGetAppName";
import { Bounce, ToastContainer } from "react-toastify";

const App = () => {
  return (
    <div className="h-screen w-full">
      <Helmet>
        <title>{useGetName}</title>
      </Helmet>

      <Nav />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition={Bounce}
      />

      <div className="md:ml-[98px] ml-[78px] md:pt-5 h-full md:h-[calc(100vh-20px)] flex flex-col">
        <div
          className="flex-1 min-h-0 ml-2 md:mr-5 p-2 md:rounded-r-2xl flex flex-col"
          style={{
            backgroundColor: PALETTE.bg,
            borderRight: `1px solid ${PALETTE.steel}`,
            boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
            cursor: "pointer",
          }}
        >
          <div className="flex-1 min-h-0 flex flex-col px-1 md:px-3 py-2 md:py-4 transition-all duration-300 ease-in-out  bg-gray-300/30 md:rounded-r-xl overflow-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
