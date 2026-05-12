import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./Pages/Home/Home";
import AuthPage from "./Pages/AuthPage";
import AccountsAndPermissions from "./Pages/AccountsAndPermissions/AccountsAndPermissions";

const MainRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {path:"/accounts-and-permissions",
        element:<AccountsAndPermissions/>
      }
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

export default MainRouter;
