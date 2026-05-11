import { Helmet } from "react-helmet-async";
import { Outlet } from "react-router";

const App = () => {
  return (
    <div>
      <Helmet>
        <title>{import.meta.env.VITE_APP_NAME}</title>
      </Helmet>
      <Outlet />
    </div>
  );
};

export default App;
