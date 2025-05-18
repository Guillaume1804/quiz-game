import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUser";
import Carousel from "../components/Carousel";
import carouselImages from "../data/carouselImages";
import Leaderboard from "../components/Leaderboard";
import PageWrapper from "../components/PageWrapper";
const API_BASE = import.meta.env.VITE_API_BASE_URL;


export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);

  const { user } = useUser();
  const guestName = localStorage.getItem("guestName");
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !guestName) {
      navigate("/login");
    }
  }, [user, guestName, navigate]);

  useEffect(() => {
    async function fetchScores() {
      try {
        const res = await fetch(`${API_BASE}/api/score`);
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Erreur chargement classement:", err);
      }
    }
    fetchScores();
  }, []);

  const username = user?.username || guestName;

  return (
    <PageWrapper>
      <div className="relative min-h-[100dvh] text-white flex items-center justify-center px-2 py-6 sm:px-6 md:px-10 overflow-hidden">
        {/* 🎞️ Carrousel de fond */}
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <Carousel images={carouselImages} />
        </div>

        {/* 🔶 Overlay orangé */}
        <div
          className="absolute top-0 left-0 w-full h-full z-[-6] pointer-events-none"
          style={{
            backgroundColor: "rgba(255, 100, 0, 0.75)",
            mixBlendMode: "soft-light",
          }}
        />

        {/* 🔳 Overlay sombre centré */}
        <div
          className="absolute top-0 left-0 w-full h-full z-[-5] pointer-events-none"
          style={{
            background: `
            radial-gradient(
              ellipse at center,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.4) 50%,
              rgba(0, 0, 0, 0.95) 75%,
              rgba(0, 0, 0, 1) 100%
            )
          `,
          }}
        />

        {/* ✅ Contenu principal */}
        <motion.div
          className="z-30 w-full max-w-4xl bg-white/15 backdrop-blur-sm rounded-xl shadow-xl px-4 py-8 sm:p-10 md:p-12 flex flex-col items-center gap-10 mt-20 sm:mt-0 blur-fade"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Titre */}
          <h1 className="text-center text-xl sm:text-3xl md:text-4xl font-title leading-snug sm:leading-tight">
            🎬 Bienvenue {username || "utilisateur"} <br />
            dans le Quiz Cinéma
          </h1>

          {/* Boutons */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 w-full">
            <Link
              to="/quiz"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded text-center font-semibold text-base sm:text-lg"
            >
              🎮 Lancer une partie
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="w-full sm:w-auto bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded text-center font-semibold text-base sm:text-lg"
              >
                ⚙️ Interface Admin
              </Link>
            )}
          </div>

          {/* Classement */}
          <div className="w-full max-w-2xl">
            <h2 className="text-lg sm:text-2xl md:text-3xl font-semibold text-center font-title mb-4">
              🏆 Classement Top 100
            </h2>
            <Leaderboard scores={leaderboard} />
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
