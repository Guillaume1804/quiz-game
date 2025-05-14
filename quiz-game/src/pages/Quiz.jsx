import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Score from "../components/Score";
import Lives from "../components/Lives";
import QuestionBox from "../components/QuestionBox";
import { useUser } from "../hooks/useUser";
import { isFreeAnswerCorrect } from "../utils/compareTitles";
import Spotlight from "../assets/spotlight.avif";
import Fireworks from "../components/Fireworks";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import PageWrapper from "../components/PageWrapper";

function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

export default function Quiz() {
  const [question, setQuestion] = useState(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [usedCitations, setUsedCitations] = useState([]);
  const [reportedIds, setReportedIds] = useState([]);
  const [reportedMessage, setReportedMessage] = useState(null);
  const [combo, setCombo] = useState(0);
  const [showNextButton, setShowNextButton] = useState(false);
  const [questionKey, setQuestionKey] = useState(0);

  const navigate = useNavigate();
  const hasFetchedOnce = useRef(false);
  const inputRef = useRef(null);
  const { user, token } = useUser();

  useEffect(() => {
    const local = localStorage.getItem("reportedQuestions") || "[]";
    setReportedIds(JSON.parse(local));
  }, []);

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/question");
      const newQuestion = res.data;

      if (usedCitations.includes(newQuestion.citation)) {
        return fetchQuestion();
      }

      const correct = newQuestion.choices.find((c) => c.isCorrect);
      const incorrect = newQuestion.choices.filter((c) => !c.isCorrect);
      const randomIncorrect =
        incorrect[Math.floor(Math.random() * incorrect.length)];

      setUsedCitations((prev) => [...prev, newQuestion.citation]);
      setQuestion({
        citation: newQuestion.citation,
        id: newQuestion.id,
        choices: {
          all: shuffleArray(newQuestion.choices),
          two: shuffleArray([correct, randomIncorrect]),
        },
      });

      setQuestionKey((prev) => prev + 1);
      setMode(null);
      setShowNextButton(false);
    } catch (err) {
      console.error("Erreur API question :", err);
    }
    setLoading(false);
  }, [usedCitations]);
  useEffect(() => {
    const guestName = localStorage.getItem("guestName");
    if (!user && !guestName) {
      navigate("/login");
      return;
    }
    if (!hasFetchedOnce.current) {
      hasFetchedOnce.current = true;
      fetchQuestion();
    }
  }, [fetchQuestion, user, navigate]);

  const endTurn = async (updatedLives = lives) => {
    const guestName = localStorage.getItem("guestName");

    if (updatedLives <= 0) {
      setFeedback(`🎉 Fin du jeu ! Ton score final est de ${score} points.`);
      setMode("end");

      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const username = user?.username || guestName || "invité_inconnu";
        await axios.post(
          "http://localhost:3001/api/score",
          { score, username },
          { headers }
        );
      } catch (err) {
        console.error("Erreur enregistrement score :", err.message);
      }
      return;
    }

    setFeedback(null);
    fetchQuestion();
  };

  const handleAnswer = (choice, basePoints) => {
    const isCorrect = choice.isCorrect;
    const correctAnswer = question.choices.all.find((c) => c.isCorrect)?.text;

    if (isCorrect) {
      const points = basePoints + combo;
      setScore((prev) => prev + points);
      setFeedback("✅ Bonne réponse !");
      setCombo((prev) => prev + 1);
      setTimeout(() => endTurn(), 2000);
    } else {
      setCombo(0);
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback({
        type: "error",
        message: `❌ Mauvaise réponse ! Le bon film était : ${correctAnswer}`,
      });

      if (newLives <= 0) {
        setTimeout(() => endTurn(newLives), 5000);
      } else {
        setShowNextButton(true);
      }
    }
  };

  const handleFreeAnswer = (userInput) => {
    const correctAnswer = question.choices.all.find((c) => c.isCorrect)?.text;
    if (!correctAnswer) return;

    const isCorrect = isFreeAnswerCorrect(userInput, correctAnswer);

    if (isCorrect) {
      const points = 5 + combo;
      setScore((prev) => prev + points);
      setFeedback("✅ Bonne réponse !");
      setCombo((prev) => prev + 1);
      setTimeout(() => endTurn(), 2000);
    } else {
      setCombo(0);
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback({
        type: "error",
        message: `❌ Mauvaise réponse ! Le bon film était : ${correctAnswer}`,
      });

      if (newLives <= 0) {
        setTimeout(() => endTurn(newLives), 5000);
      } else {
        setShowNextButton(true);
      }
    }
  };

  const handleReport = async () => {
    if (!question?.id || reportedIds.includes(question.id)) return;

    try {
      await axios.post(
        "http://localhost:3001/api/admin/report",
        { question_id: question.id, reported_by: user?.id || null },
        token ? { headers: { Authorization: `Bearer ${token}` } } : {}
      );

      const updated = [...reportedIds, question.id];
      setReportedIds(updated);
      if (!user)
        localStorage.setItem("reportedQuestions", JSON.stringify(updated));

      setReportedMessage(
        "Merci d'avoir signalé cette question, on s'en occupe rapidement."
      );
    } catch (err) {
      console.error("Erreur lors du signalement :", err);
      alert("Erreur : Cette question est peut-être déjà signalée.");
    }
  };

  useEffect(() => {
    if (mode === "free" && inputRef.current) inputRef.current.focus();
  }, [mode]);

  return (
  <PageWrapper>
    <div className="relative min-h-screen text-gray-200 font-body overflow-hidden">
      {mode === "end" && <Fireworks />}

      <div
        className="absolute top-0 left-0 w-full h-full -z-10"
        style={{
          backgroundImage: `url(${Spotlight})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      <div className="relative px-4 py-8 flex flex-col items-center justify-center gap-4 min-h-screen">
        <div className="flex flex-row gap-16">
          <Score value={score} combo={combo} />
          <Lives count={lives} />
        </div>

        {loading ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-lg text-gray-200 font-medium"
          >
            Chargement de la question...
          </motion.p>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={questionKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center gap-6"
            >
              {mode === "end" && feedback ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-gradient-to-br from-purple-800 to-black text-white text-center rounded-xl p-8 shadow-xl max-w-md w-full"
                >
                  <h2 className="text-3xl font-bold mb-4">🎉 Fin du jeu !</h2>
                  <p className="text-xl font-semibold mb-6">
                    Ton score final est de{" "}
                    <span className="text-yellow-400">{score} points</span>.
                  </p>
                  <button
                    onClick={() => {
                      const guestName = localStorage.getItem("guestName");
                      if (guestName) {
                        localStorage.removeItem("guestName");
                        navigate("/login");
                      } else {
                        navigate("/");
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded text-white transition"
                  >
                    Retour à l'accueil
                  </button>
                </motion.div>
              ) : (
                <>
                  {/* Citation + signalement */}
                  {!feedback && !reportedMessage && (
                    <>
                      <p className="text-xl font-semibold text-center max-w-2xl">
                        “{question?.citation}”
                      </p>

                      <button
                        onClick={handleReport}
                        disabled={reportedIds.includes(question.id)}
                        className={`text-sm underline ${
                          reportedIds.includes(question.id)
                            ? "text-gray-400 cursor-not-allowed"
                            : "text-red-500 hover:text-red-600"
                        }`}
                      >
                        {reportedIds.includes(question.id)
                          ? "Déjà signalée"
                          : "Signaler cette question"}
                      </button>
                    </>
                  )}

                  {/* Message après signalement */}
                  <AnimatePresence mode="wait">
                    {reportedMessage && (
                      <motion.div
                        key="reportMessage"
                        initial={{ rotateY: 90, opacity: 0 }}
                        animate={{ rotateY: 0, opacity: 1 }}
                        exit={{ rotateY: -90, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="flex flex-col items-center gap-4 mt-6 text-center bg-green-100/10 p-4 rounded shadow-lg max-w-lg"
                      >
                        <p className="text-lg text-green-400 font-semibold">
                          {reportedMessage}
                        </p>
                        <button
                          onClick={() => {
                            setReportedMessage(null);
                            fetchQuestion();
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
                        >
                          👉 Passer à la question suivante
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Mode de réponse */}
                  {!feedback && !reportedMessage && !mode && (
                    <div className="flex flex-col items-center gap-3 mt-6">
                      <h2 className="text-lg font-semibold font-title">
                        Choisis ton mode de réponse :
                      </h2>
                      <button
                        onClick={() => setMode("2")}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                      >
                        2 choix (1 point)
                      </button>
                      <button
                        onClick={() => setMode("4")}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                      >
                        4 choix (3 points)
                      </button>
                      <button
                        onClick={() => setMode("free")}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                      >
                        Réponse libre (5 points)
                      </button>
                    </div>
                  )}

                  {/* Composants QuestionBox / Input */}
                  <AnimatePresence mode="wait">
                    {!feedback && !reportedMessage && mode === "2" && (
                      <motion.div
                        key="mode2"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <QuestionBox
                          choices={question.choices.two}
                          onAnswer={(c) => handleAnswer(c, 1)}
                        />
                      </motion.div>
                    )}

                    {!feedback && !reportedMessage && mode === "4" && (
                      <motion.div
                        key="mode4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <QuestionBox
                          choices={question.choices.all}
                          onAnswer={(c) => handleAnswer(c, 3)}
                        />
                      </motion.div>
                    )}

                    {!feedback && !reportedMessage && mode === "free" && (
                      <motion.div
                        key="modeFree"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col gap-2 items-center mt-4"
                      >
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Tape ta réponse ici..."
                          className="p-2 w-full max-w-md rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const input = inputRef.current.value.trim();
                              if (input) {
                                handleFreeAnswer(input);
                                inputRef.current.value = "";
                              }
                            }
                          }}
                        />
                        <p className="text-sm text-gray-500">
                          Appuie sur <strong>Entrée</strong> pour valider
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Feedback bonne ou mauvaise réponse */}
                  {feedback &&
                    typeof feedback === "string" &&
                    mode !== "end" && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                        className="flex items-center gap-3 px-6 py-3 bg-green-600 text-white rounded-full shadow-lg text-lg font-semibold"
                      >
                        ✅ {feedback}
                      </motion.div>
                    )}

                  {feedback &&
                    typeof feedback === "object" &&
                    feedback.type === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="px-6 py-4 bg-red-600 text-white rounded-xl shadow-lg text-center max-w-xl w-full"
                      >
                        <p className="font-semibold text-lg">
                          ❌ Mauvaise réponse ! Le bon film était : <br />
                          <span className="italic text-yellow-300">
                            {feedback.message.split(":")[1]?.trim()}
                          </span>
                        </p>
                        <p className="text-sm mt-2 text-white/80">
                          {lives > 0
                            ? "Essaie la prochaine !"
                            : "Fin du jeu dans 5 secondes..."}
                        </p>
                        {showNextButton && (
                          <button
                            onClick={() => endTurn()}
                            className="mt-4 bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded text-white transition"
                          >
                            Question suivante
                          </button>
                        )}
                      </motion.div>
                    )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  </PageWrapper>
);

}
