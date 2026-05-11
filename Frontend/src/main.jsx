import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import "./index.css";
import { RouterProvider } from "react-router";
import MainRouter from "./MainRouter.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <RouterProvider router={MainRouter} />
    </HelmetProvider>
  </StrictMode>,
);
