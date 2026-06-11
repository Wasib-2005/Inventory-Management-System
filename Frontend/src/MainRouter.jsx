import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./Pages/Home/Home";
import AuthPage from "./Pages/Auth/AuthPage";
import AccountsAndPermissions from "./Pages/AccountsAndPermissions/AccountsAndPermissions";
import RoleManagement from "./Components/RoleManagement/RoleManagement";

const MainRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      { path: "role-management", element: <RoleManagement /> },
      {
        path: "/accounts-and-permissions",
        element: <AccountsAndPermissions />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

export default MainRouter;
