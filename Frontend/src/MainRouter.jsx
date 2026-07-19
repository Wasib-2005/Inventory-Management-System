import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./Pages/Home/Home";
import AuthPage from "./Pages/Auth/AuthPage";
import AccountsAndPermissions from "./Pages/AccountsAndPermissions/AccountsAndPermissions";
import RoleManagement from "./Pages/RolePage/RoleManagement";
import Products from "./Pages/Products/Products";
import UserProfile from "./Pages/UserProfile/UserProfile";
import ProtectedRouteUser from "./ProtectedRoute/ProtectedRouteUser";
import Warehouse from "./Pages/Warehouse/Warehouse";
import Register from "./Pages/Register/Register";
import ProtectedRouteWarehouse from "./ProtectedRoute/ProtectedRouteWarehouse";

const MainRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRouteUser>
        <App />
      </ProtectedRouteUser>
    ),
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/register/:selection",
        element: (
          <ProtectedRouteWarehouse>
            <Register />
          </ProtectedRouteWarehouse>
        ),
      },
      { path: "/products", element: <Products /> },
      { path: "/role-management", element: <RoleManagement /> },
      {
        path: "/accounts-and-permissions",
        element: <AccountsAndPermissions />,
      },
      {
        path: "/user",
        element: <UserProfile />,
      },
      {
        path: "/warehouse",
        element: <Warehouse />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

export default MainRouter;
