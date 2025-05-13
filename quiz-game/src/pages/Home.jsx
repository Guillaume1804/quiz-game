import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUser";
import Carousel from "../components/Carousel";
import carouselImages from "../data/carouselImages";

export default function Home() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const scoresPerPage = 10;

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
        const res = await fetch("http://localhost:3001/api/score");
        const data = await res.json();
        setLeaderboard(data);
      } catch (err) {
        console.error("Erreur chargement classement:", err);
      }
    }
    fetchScores();
  }, []);

  const getMedal = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return `${index + 1}.`;
  };

  const indexOfLastScore = currentPage * scoresPerPage;
  const indexOfFirstScore = indexOfLastScore - scoresPerPage;
  const currentScores = leaderboard.slice(indexOfFirstScore, indexOfLastScore);
  const totalPages = Math.ceil(leaderboard.length / scoresPerPage);

  const username = user?.username || guestName;

  return (
    <div className="relative h-screen text-white overflow-hidden flex flex-col items-center justify-center px-4 py-8">
      {/* Carrousel en fond */}
      <div className="absolute top-0 left-0 w-full h-full -z-10">
        <Carousel images={carouselImages} />
      </div>

      {/* Overlay orangé général sous l’effet sombre */}
      <div
        className="absolute top-0 left-0 w-full h-full z-[-6] pointer-events-none"
        style={{
          backgroundColor: "rgba(255, 100, 0, 0.75)", // orange doux et large
          mixBlendMode: "soft-light", // ou "screen" pour tester d'autres effets
        }}
      />

      {/* Overlay sombre/orangé au-dessus du carrousel */}
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

      {/* Contenu principal AVEC fond flouté */}
      <motion.div
        className="z-30 flex flex-col items-center gap-12 w-full max-w-5xl mx-auto backdrop-blur-md bg-white/15 rounded-xl shadow-xl py-6 px-4 sm:px-6 lg:px-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl sm:text-4xl text-center font-title">
          🎬 Bienvenue {username || "utilisateur"} dans le Quiz Cinéma
        </h1>
        <div className="flex flex-col md:flex-row gap-4">
          <Link
            to="/quiz"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-center font-title"
          >
            🎮 Lancer une partie
          </Link>
          {user?.role === "admin" && (
            <Link
              to="/admin"
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded text-center font-title"
            >
              ⚙️ Interface Admin
            </Link>
          )}
        </div>

        {/* Classement */}
        <div className="flex flex-col items-center w-full sm:w-3/4 px-2 sm:px-0">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-center font-title">
            🏆 Classement Top 100
          </h2>

          <div className="w-full bg-white text-black rounded shadow max-h-[280px] overflow-y-auto">
            <ul className="divide-y divide-gray-300">
              {currentScores.length === 0 ? (
                <li className="p-4 text-center font-title">
                  Aucun score enregistré pour le moment.
                </li>
              ) : (
                currentScores.map((entry, index) => (
                  <li
                    key={index}
                    className="p-2 px-4 flex justify-between font-body"
                  >
                    <span className="font-title">
                      {getMedal(indexOfFirstScore + index)}{" "}
                      {entry.username ? "🧑‍💻" : "👤"}{" "}
                      {entry.username || "Anonyme"}
                    </span>
                    <span className="font-body">{entry.score} pts</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-3 gap-2 flex-wrap">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
