import React from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import App from "./App";
import Home from "./pages/HomeCopy";
import Quiz from "./pages/Quiz";
import Admin from "./pages/Admin";
import LoginRegister from "./pages/LoginRegister";
import { UserProvider } from "./context/UserProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, // layout commun
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute redirectIfNotGuest>
            <Home />
          </ProtectedRoute>
        ),
      },
      {
        path: "login",
        element: <LoginRegister />,
      },
      {
        path: "quiz",
        element: <Quiz />, // accessible à tous
      },
      {
        path: "admin",
        element: (
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </React.StrictMode>
);
