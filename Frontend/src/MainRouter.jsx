import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./Pages/Home/Home";
import AuthPage from "./Pages/AuthPage";

const MainRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {path:"/accounts"}
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

export default MainRouter;
