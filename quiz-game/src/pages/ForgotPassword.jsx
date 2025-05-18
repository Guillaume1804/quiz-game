import { useState } from "react";
import axios from "axios";
import PageWrapper from "../components/PageWrapper";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false); // 🔒 empêche les doubles clics

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setSubmitted(true);

    // 🔁 Réactive le bouton après 30 secondes dans tous les cas
    setTimeout(() => setSubmitted(false), 30000);

    try {
      await axios.post(`${API_BASE}/api/auth/request-reset`, { email });
      setMessage("Un lien de réinitialisation a été envoyé si l'email existe.");
      // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setError("Une erreur est survenue. Réessaie plus tard.");
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-semibold mb-4">Mot de passe oublié</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Ton adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="p-3 border rounded"
            />
            <button
              type="submit"
              disabled={submitted} // ✅ bloqué après clic
              className={`p-2 rounded font-semibold text-white transition ${
                submitted
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {submitted ? "Lien envoyé" : "Envoyer le lien"}
            </button>

            {message && <p className="text-green-600 text-sm">{message}</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
