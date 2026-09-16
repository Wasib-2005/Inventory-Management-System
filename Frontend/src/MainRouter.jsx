import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";
import ProtectedRouteUser from "./ProtectedRoute/ProtectedRouteUser";
import ProtectedRouteWarehouse from "./ProtectedRoute/ProtectedRouteWarehouse";

const App = lazy(() => import("./App"));
const Home = lazy(() => import("./Pages/Home/Home"));
const AuthPage = lazy(() => import("./Pages/Auth/AuthPage"));
const AccountsAndPermissions = lazy(() =>
  import("./Pages/AccountsAndPermissions/AccountsAndPermissions"),
);
const RoleManagement = lazy(() => import("./Pages/RolePage/RoleManagement"));
const Products = lazy(() => import("./Pages/Products/Products"));
const UserProfile = lazy(() => import("./Pages/UserProfile/UserProfile"));
const Warehouse = lazy(() => import("./Pages/Warehouse/Warehouse"));
const Register = lazy(() => import("./Pages/Register/Register"));
const RecycleBin = lazy(() => import("./Pages/RecycleBin/RecycleBin"));

const pageFallback = (
  <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-500">
    Loading page...
  </div>
);

const lazyPage = (Page) => (
  <Suspense fallback={pageFallback}>
    <Page />
  </Suspense>
);

const MainRouter = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRouteUser>
        {lazyPage(App)}
      </ProtectedRouteUser>
    ),
    children: [
      {
        path: "/",
        element: lazyPage(Home),
      },
      {
        path: "/register/:selection/*",
        element: (
          <ProtectedRouteWarehouse>
            {lazyPage(Register)}
          </ProtectedRouteWarehouse>
        ),
      },
      { path: "/products", element: lazyPage(Products) },
      { path: "/role-management", element: lazyPage(RoleManagement) },
      {
        path: "/accounts-and-permissions",
        element: lazyPage(AccountsAndPermissions),
      },
      {
        path: "/user",
        element: lazyPage(UserProfile),
      },
      {
        path: "/warehouse",
        element: lazyPage(Warehouse),
      },
      {
        path: "/recycle-bin",
        element: lazyPage(RecycleBin),
      },
    ],
  },
  {
    path: "/auth",
    element: lazyPage(AuthPage),
  },
]);

export default MainRouter;
