import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../hooks/useUser";
import background from "../assets/7989386-hd_2048_1080_25fps.mp4"; // vidéo locale
import PageWrapper from "../components/PageWrapper";


function generateGuestName() {
  const id = Math.floor(1000 + Math.random() * 9000);
  return `invité_${id}`;
}

export default function LoginRegister() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
  const [error, setError] = useState(null);
  const { login } = useUser();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const payload =
        mode === "register"
          ? { username, email, password }
          : { email, password };

      const res = await axios.post(
        `http://localhost:3001/api/auth/${mode}`,
        payload
      );
      login(res.data.token);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Erreur inconnue");
    }
  };

  const handleGuest = () => {
    const guestName = generateGuestName();
    localStorage.setItem("guestName", guestName);
    login(null);
    navigate("/quiz");
  };

  return (
    <PageWrapper>
      <div className="relative min-h-screen flex items-center justify-center px-4 font-body overflow-hidden">
        {/* 🎥 Vidéo de fond */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        >
          <source src={background} type="video/mp4" />
          Votre navigateur ne supporte pas les vidéos HTML5.
        </video>

        {/* Overlay sombre par-dessus la vidéo */}
        <div className="absolute top-0 left-0 w-full h-full bg-black/60 -z-10" />

        {/* 🔲 Fond flouté semi-transparent pour lisibilité */}
        <div className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-200 z-10">
          <h1 className="text-2xl font-title text-center text-gray-900 mb-6">
            {mode === "login" ? "Connexion" : "Inscription"}
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "register" && (
              <>
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Adresse email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </>
            )}

            {mode === "login" && (
              <input
                type="email"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            )}

            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />

            <button
              type="submit"
              className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold"
            >
              {mode === "login" ? "Se connecter" : "Créer un compte"}
            </button>

            <button
              type="button"
              onClick={handleGuest}
              className="bg-gray-100 text-gray-700 py-2 rounded hover:bg-gray-200 transition"
            >
              🎮 Jouer en tant qu'invité
            </button>

            <p className="text-sm text-center text-gray-600">
              {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
              <button
                type="button"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-blue-600 hover:underline font-medium"
              >
                {mode === "login" ? "Créer un compte" : "Se connecter"}
              </button>
            </p>

            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
