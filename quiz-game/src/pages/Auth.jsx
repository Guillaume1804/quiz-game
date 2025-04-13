import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const url = `http://localhost:3001/api/${isRegister ? "register" : "login"}`;

    try {
      const res = await axios.post(url, form);
      localStorage.setItem("token", res.data.token);
      alert("Connexion réussie ✅");
      navigate("/quiz"); // ou autre route sécurisée
    } catch (err) {
      setError(err.response?.data?.error || "Erreur inconnue");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow w-full max-w-md space-y-4">
        <h2 className="text-2xl font-bold text-center">
          {isRegister ? "Inscription" : "Connexion"}
        </h2>

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {isRegister && (
          <input
            type="text"
            name="username"
            placeholder="Nom d'utilisateur"
            value={form.username}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        )}

        <input
          type="password"
          name="password"
          placeholder="Mot de passe"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        />

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
          {isRegister ? "Créer un compte" : "Se connecter"}
        </button>

        <p className="text-center text-sm">
          {isRegister ? "Déjà inscrit ?" : "Pas encore de compte ?"} {" "}
          <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-blue-600 underline">
            {isRegister ? "Connexion" : "Inscription"}
          </button>
        </p>
      </form>
    </div>
  );
}
