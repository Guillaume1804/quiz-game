/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Leaderboard({ scores }) {
  const [currentPage, setCurrentPage] = useState(1);
  const scoresPerPage = 9;

  const podium = scores.slice(0, 3);
  const remaining = scores.slice(3);

  const indexOfLast = currentPage * scoresPerPage;
  const indexOfFirst = indexOfLast - scoresPerPage;
  const current = remaining.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(remaining.length / scoresPerPage);

  const guestName = localStorage.getItem("guestName");
  const storedUser = localStorage.getItem("user");
  const currentUser =
    JSON.parse(storedUser)?.username || guestName || "Anonyme";

  return (
    <div className="w-full flex flex-col gap-8 items-center">
      {/* Podium */}
      <div className="flex justify-center items-end gap-4 flex-wrap mt-2">
        {[1, 0, 2].map((visualIndex, i) => {
          const entry = podium[visualIndex];
          const height = [120, 160, 100][i];
          const rank = ["🥈", "🥇", "🥉"][i];

          return (
            <motion.div
              key={i}
              initial={{ y: 50, scale: 0.8, opacity: 0 }}
              animate={{ y: 0, scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 * i, duration: 0.5 }}
              className="flex flex-col items-center justify-end bg-gradient-to-t from-yellow-100 to-yellow-300 shadow-md rounded-t-lg w-20 sm:w-24 text-center px-2 py-3"
              style={{ height }}
            >
              <div className="text-xl sm:text-2xl">{rank}</div>
              <div className="text-sm font-bold truncate">
                {entry?.username || "Anonyme"}
              </div>
              <div className="text-xs">{entry?.score} pts</div>
            </motion.div>
          );
        })}
      </div>

      {/* Grille des suivants */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {current.map((entry, i) => {
          const globalRank = indexOfFirst + i + 4;
          const isHighlighted =
            entry.username === currentUser && globalRank <= 10;

          return (
            <motion.div
              key={`${globalRank}-${entry.username}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }} // <-- effet de survol Framer Motion
              transition={{ delay: 0.05 * i, duration: 0.2, ease: "easeOut" }}
              className={`rounded-lg shadow-md p-3 text-center backdrop-blur-md ${
                isHighlighted
                  ? "bg-yellow-200 ring-2 ring-yellow-500 text-black"
                  : "bg-white/90 text-black"
              }`}
            >
              <p className="font-bold text-lg">{globalRank}</p>
              <p className="truncate text-sm">{entry.username || "Anonyme"}</p>
              <p className="text-blue-800 font-semibold">{entry.score} pts</p>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex gap-2 justify-center mt-4 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded text-sm font-medium ${
                currentPage === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
