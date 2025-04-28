import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useUser } from "../hooks/useUser";

import plan1Data from "../assets/plan1.json";
import plan2Data from "../assets/plan2.json";
import plan3Data from "../assets/plan3.json";

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

  const username = user?.username || guestName;

  const renderPlan = (planData, delayStart, zIndex) =>
    planData.map((img, index) => (
      <div
        key={index}
        className="absolute"
        style={{
          top: img.top || undefined,
          bottom: img.bottom || undefined,
          left: img.left || undefined,
          right: img.right || undefined,
          width: img.width,
          height: "auto",
          pointerEvents: "none",
          zIndex,
        }}
      >
        <motion.img
          src={new URL(img.src, import.meta.url).href}
          alt={`perso-${index}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delayStart + index * 0.15 }}
          className="w-full h-auto"
        />
        {img.blurred && (
          <div className="fade-bottom-overlay"></div>
        )}
      </div>
    ));
  
    
  
  return (
    <div className="relative h-[calc(100vh-56px)] bg-white text-black overflow-hidden flex flex-col items-center justify-center gap-8 px-4 py-8">
      {/* 🌟 Fond des personnages */}
      <div className="absolute inset-0 pointer-events-none">
        {renderPlan(plan1Data, 0.6, 10)}
        {renderPlan(plan2Data, 1.2, 20)}
        {renderPlan(plan3Data, 1.8, 30)}
      </div>

      {/* 🌟 Contenu principal */}
      <motion.h1
        className="text-4xl md:text-5xl font-bold text-center z-50"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
      >
        🎬 Bienvenue {username || "utilisateur"} dans le Quiz Cinéma
      </motion.h1>

      <motion.div
        className="flex flex-col md:flex-row gap-4 z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
      >
        <Link
          to="/quiz"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded text-center"
        >
          🎮 Lancer une partie
        </Link>
        {user?.role === "admin" && (
          <Link
            to="/admin"
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded text-center"
          >
            ⚙️ Interface Admin
          </Link>
        )}
      </motion.div>

      <motion.div
        className="mt-10 w-full max-w-2xl z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4 }}
      >
        <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-center">
          🏆 Classement Top 100
        </h2>
        <ul className="bg-white text-black rounded shadow divide-y divide-gray-300 max-h-[400px] overflow-y-auto">
          {leaderboard.length === 0 ? (
            <li className="p-4 text-center">
              Aucun score enregistré pour le moment.
            </li>
          ) : (
            leaderboard.map((entry, index) => (
              <li
                key={index}
                className="p-2 px-4 flex justify-between font-medium"
              >
                <span>
                  {getMedal(index)} {entry.username ? "🧑‍💻" : "👤"}{" "}
                  {entry.username || "Anonyme"}
                </span>
                <span>{entry.score} pts</span>
              </li>
            ))
          )}
        </ul>
      </motion.div>
    </div>
  );
}
