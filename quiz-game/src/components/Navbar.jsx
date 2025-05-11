import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline"; // <-- Heroicon logout

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();

  return (
    <nav className="absolute top-0 left-0 w-full z-30 bg-transparent px-6 py-4 flex justify-between items-center font-body">
      {/* Logo / Titre */}
      <div className="text-xl font-title text-gray-300 tracking-wide">
        <Link to="/" className="hover:opacity-80 transition">
          🎬 Quiz Cinéma
        </Link>
      </div>

      {/* Actions utilisateur */}
      <div className="flex items-center gap-4">
        {user && (
          <span className="text-sm text-gray-300">
            Bonjour, <span className="font-semibold">{user.username}</span>
          </span>
        )}

        {user ? (
          <button
            onClick={() => {
              logout();
              localStorage.removeItem("guestName");
              navigate("/login");
            }}
            className="text-red-500 hover:text-red-600 transition"
            title="Déconnexion"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
          </button>
        ) : (
          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-title text-sm transition"
          >
            Connexion
          </Link>
        )}
      </div>
    </nav>
  );
}
