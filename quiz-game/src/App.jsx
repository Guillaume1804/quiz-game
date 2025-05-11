// ✅ La bonne version de App.jsx
import Navbar from "./components/Navbar";
import { Outlet } from "react-router-dom";

export default function App() {
  return (
    <div className="min-h-screen bg-transparent text-black relative">
      <Navbar />
      <Outlet />
    </div>
  );
}
