// main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Admin from "./pages/Admin";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Auth from "./pages/Auth";
import LoginRegister from "./pages/LoginRegister";
import { UserProvider } from "./context/UserProvider";
import ProtectedRoute from "./components/ProtectedRoute"; // 👈 à ajouter

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<LoginRegister />} />
          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <Quiz />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </UserProvider>
  </React.StrictMode>
);
