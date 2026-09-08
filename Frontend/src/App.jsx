import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";
import Nav from "./Components/Nav/Nav";
import { PALETTE } from "./Theme/palette";
import { useGetName } from "./Hooks/userGetAppName";
import { Bounce, ToastContainer } from "react-toastify";
import AnimatedPage from "./Components/Common/AnimatedPage";

const App = () => {
  return (
    <div className="app-shell relative w-full min-h-screen overflow-hidden">
      <div className="app-orb app-orb-one" aria-hidden="true" />
      <div className="app-orb app-orb-two" aria-hidden="true" />
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

      <div className="relative z-10 ml-0 pt-16 md:ml-[98px] md:pt-5 min-h-screen flex flex-col">
        <div
          className="flex-1 min-h-0 mx-0 sm:mx-1 md:mr-5 p-2 sm:p-3 md:p-5 rounded-2xl rounded-t-none md:rounded-t-2xl md:rounded-l-none flex flex-col"
          style={{
            backgroundColor: PALETTE.bg,
            borderRight: `1px solid ${PALETTE.steel}`,
            boxShadow: "2px 0 16px rgba(187,213,218,0.3)",
            cursor: "pointer",
          }}
        >
          <div           className="flex-1 min-h-0 flex flex-col min-w-0 px-1 sm:px-2 md:px-3 py-2 sm:py-3 md:py-4 transition-all duration-300 ease-in-out bg-gray-300/30 rounded-xl rounded-t-none md:rounded-t-xl md:rounded-l-none overflow-x-auto overflow-y-auto">
            <AnimatedPage>
              <Outlet />
            </AnimatedPage>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
