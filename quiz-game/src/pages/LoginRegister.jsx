import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../hooks/useUser";

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
        mode === "register" ? { username, email, password } : { email, password };

      const res = await axios.post(`http://localhost:3001/api/auth/${mode}`, payload);
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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
      <h1 className="text-3xl mb-6">
        {mode === "login" ? "Connexion" : "Inscription"}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
        {mode === "register" && (
          <>
            <input
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="p-2 rounded text-black"
              required
            />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-2 rounded text-black"
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
            className="p-2 rounded text-black"
            required
          />
        )}

        <input
          type="password"
          placeholder="Mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded text-black"
          required
        />

        <button type="submit" className="bg-blue-500 px-4 py-2 rounded">
          {mode === "login" ? "Se connecter" : "Créer un compte"}
        </button>

        <button type="button" className="bg-gray-600 px-4 py-2 rounded" onClick={handleGuest}>
          🎮 Jouer en tant qu'invité
        </button>

        <p className="text-sm text-center">
          {mode === "login" ? "Pas encore de compte ?" : "Déjà un compte ?"}{" "}
          <button
            type="button"
            className="text-blue-300 underline"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Créer un compte" : "Se connecter"}
          </button>
        </p>

        {error && <p className="text-red-400 mt-2 text-sm text-center">{error}</p>}
      </form>
    </div>
  );
}
