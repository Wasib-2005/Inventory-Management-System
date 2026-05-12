import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";
import Nav from "./Components/Nav";

const App = () => {
  return (
    <div>
      <Helmet>
        <title>{import.meta.env.VITE_APP_NAME}</title>
      </Helmet>
      <div>
        <Nav />
        <div className="md:ml-[98px] ml-[78px] md:mt-5">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
