import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import background from "../assets/7989386-hd_2048_1080_25fps.mp4";
import PageWrapper from "../components/PageWrapper";
import { toast } from "react-toastify";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Récupération du token dans l'URL
  useEffect(() => {
    const urlToken = searchParams.get("token");
    if (!urlToken) {
      setError("Lien invalide.");
    } else {
      setToken(urlToken);
    }
  }, [searchParams]);

  const handleReset = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/reset-password`, {
        token,
        password,
      });

      if (res.data.success) {
        toast.success("Mot de passe réinitialisé !");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (err) {
      setError(
        err.response?.data?.error || "Erreur lors de la réinitialisation."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="relative min-h-screen flex items-center justify-center px-4 font-body overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute top-0 left-0 w-full h-full object-cover -z-10"
        >
          <source src={background} type="video/mp4" />
          Votre navigateur ne supporte pas la vidéo.
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black/60 -z-10" />

        <div className="w-full max-w-sm bg-white/70 backdrop-blur-md rounded-lg shadow-md p-6 border border-gray-200 z-10">
          <h1 className="text-xl font-title text-center text-gray-900 mb-6">
            Nouveau mot de passe
          </h1>

          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <input
              type="password"
              placeholder="Nouveau mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className={`bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition font-semibold ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Réinitialisation..." : "Réinitialiser"}
            </button>
            {error && (
              <p className="text-red-500 text-sm text-center mt-2">{error}</p>
            )}
          </form>
        </div>
      </div>
    </PageWrapper>
  );
}
