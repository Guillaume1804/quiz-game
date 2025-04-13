import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../hooks/useUser";

export default function LoginRegister() {
  const [mode, setMode] = useState("login"); // "register" ou "login"
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const { user, login } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = mode === "register" ? "/register" : "/login";
    const payload =
  mode === "register"
    ? { email, username: pseudo, password }
    : { email, password };

    try {
      const res = await axios.post(
        `http://localhost:3001/api${endpoint}`,
        payload
      );
      login(res.data.token); // met à jour le contexte + localStorage
      navigate("/"); // redirige vers l'accueil
    } catch (err) {
      alert("Erreur : " + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex items-center justify-center">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-xl font-bold mb-4">
          {mode === "login" ? "Connexion" : "Inscription"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          {mode === "register" && (
            <input
              type="text"
              required
              placeholder="Pseudo"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          )}
          <input
            type="password"
            required
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border px-3 py-2 rounded"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
          >
            {mode === "login" ? "Se connecter" : "S'inscrire"}
          </button>
        </form>

        <p className="mt-4 text-sm text-center">
          {mode === "login" ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
          <button
            className="text-blue-600 underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>
      </div>
    </div>
  );
}
