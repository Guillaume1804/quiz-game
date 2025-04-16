// components/Navbar.jsx
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  return (
    <div className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="font-bold text-lg">
        <Link to="/">🎬 Quiz Cinéma</Link>
      </div>

      {user ? (
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">Bonjour, {user.username}</span>
          <button
            onClick={() => {
              logout();
              localStorage.removeItem("guestName");
              navigate("/login");
            }}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
          >
            Déconnexion
          </button>
        </div>
      ) : (
        <Link
          to="/login"
          className="bg-blue-500 px-3 py-1 rounded hover:bg-blue-600"
        >
          Connexion
        </Link>
      )}
    </div>
  );
}
