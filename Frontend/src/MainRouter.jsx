import { createBrowserRouter } from "react-router";
import App from "./App";
import Home from "./Components/Home/Home";
import AuthPage from "./Components/Auth/AuthPage";

const MainRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
    ],
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
]);

export default MainRouter;
