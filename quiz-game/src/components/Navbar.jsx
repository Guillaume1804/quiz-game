import { Link, useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";

export default function Navbar() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();

  const isLoginPage = location.pathname === "/login";

  return (
    <nav className="absolute top-0 left-0 w-full z-30 bg-transparent px-4 md:px-6 py-4 font-body">
      {/* Container flex */}
      <div className="flex items-center justify-between w-full">
        {/* 🎬 Logo */}
        <div className={`w-full ${!isLoginPage ? "md:w-auto" : "text-center"}`}>
          <Link
            to="/"
            className={`text-lg sm:text-xl font-title text-gray-300 tracking-wide hover:opacity-80 transition ${
              isLoginPage ? "block mx-auto" : ""
            }`}
          >
            🎬 Quiz Cinéma
          </Link>
        </div>

        {/* 🧑 Actions utilisateur (pas sur /login) */}
        {!isLoginPage && (
          <div className="flex items-center gap-2 sm:gap-4">
            {user && (
              <span className="hidden md:inline text-sm text-gray-300">
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
        )}
      </div>
    </nav>
  );
}
