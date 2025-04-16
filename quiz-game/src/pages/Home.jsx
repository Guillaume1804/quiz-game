import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../hooks/useUser";

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
        const res = await axios.get("http://localhost:3001/api/score");
        setLeaderboard(res.data);
      } catch (err) {
        console.error("Erreur chargement classement:", err);
        setLeaderboard([]);
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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center gap-8 p-4">
      <h1 className="text-4xl font-bold text-center">
        🎬 Bienvenue {username || "utilisateur"} dans le Quiz Cinéma
      </h1>

      <div className="flex gap-4">
        <Link
          to="/quiz"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          🎮 Lancer une partie
        </Link>
        {user?.username === "Guillaume" && (
          <Link
            to="/admin"
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
          >
            ⚙️ Interface Admin
          </Link>
        )}
      </div>

      <div className="mt-10 w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          🏆 Classement Top 100
        </h2>
        <ul className="bg-white text-black rounded shadow divide-y divide-gray-300 max-h-[600px] overflow-y-auto">
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
                  {getMedal(index)}{" "}
                  {entry.username.startsWith("invité_") ? "👤" : "🧑‍💻"}{" "}
                  {entry.username}
                </span>
                <span>{entry.score} pts</span>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
