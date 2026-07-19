import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { RouterProvider } from "react-router";
import MainRouter from "./MainRouter.jsx";
import UserContextProvider from "./Contexts/UserContexts/UserContextProvider.jsx";
import { WareHouseContextProvider } from "./Contexts/WareHouseContext/WareHouseContextProvider.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <UserContextProvider>
        <WareHouseContextProvider>
          <RouterProvider router={MainRouter} />
        </WareHouseContextProvider>
      </UserContextProvider>
    </HelmetProvider>
  </StrictMode>,
);
