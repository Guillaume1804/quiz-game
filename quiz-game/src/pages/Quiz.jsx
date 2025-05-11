import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Score from "../components/Score";
import Lives from "../components/Lives";
import QuestionBox from "../components/QuestionBox";
import { useUser } from "../hooks/useUser";
import { isFreeAnswerCorrect } from "../utils/compareTitles";
import Spotlight from "../assets/spotlight.avif";

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
        fetchQuestion();
        return;
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

      setMode(null);
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

  const endTurn = async (isCorrect) => {
    const guestName = localStorage.getItem("guestName");

    if (!isCorrect && lives - 1 <= 0) {
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

      return; // Ne pas rediriger immédiatement
    }

    setFeedback(null);
    fetchQuestion();
  };

  const handleAnswer = (choice, points) => {
    const isCorrect = choice.isCorrect;
    const correctAnswer = question.choices.all.find((c) => c.isCorrect)?.text;

    if (isCorrect) {
      setFeedback("✅ Bonne réponse !");
      setScore((prev) => prev + points);
    } else {
      setFeedback({
        type: "error",
        message: `❌ Mauvaise réponse ! Le bon film était : ${correctAnswer}`,
      });
      setLives((prev) => prev - 1);
    }

    setTimeout(() => endTurn(isCorrect), 2000);
  };

  const handleFreeAnswer = (userInput) => {
    const correctAnswer = question.choices.all.find((c) => c.isCorrect)?.text;
    if (!correctAnswer) return;

    const isCorrect = isFreeAnswerCorrect(userInput, correctAnswer);

    if (isCorrect) {
      setFeedback("✅ Bonne réponse !");
      setScore((prev) => prev + 5);
    } else {
      setFeedback({
        type: "error",
        message: `❌ Mauvaise réponse ! Le bon film était : ${correctAnswer}`,
      });
      setLives((prev) => prev - 1);
    }

    setTimeout(() => endTurn(isCorrect), 2000);
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
    <div className="relative min-h-screen text-gray-200 font-body overflow-hidden">
      {/* IMAGE DE FOND */}
      <div
        className="absolute top-0 left-0 w-full h-full -z-10"
        style={{
          backgroundImage: `url(${Spotlight})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {/* CONTENU */}
      <div className="relative px-4 py-8 flex flex-col items-center justify-center gap-4 min-h-screen">
        <div className="flex flex-row gap-16">
          <Score value={score} />
          <Lives count={lives} />
        </div>

        {loading ? (
          <p className="text-lg text-gray-200 font-medium">
            Chargement de la question...
          </p>
        ) : (
          <>
            {mode === "end" && feedback && (
              <div className="flex flex-col items-center gap-4 text-center">
                <p className="text-2xl font-bold text-green-700">{feedback}</p>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded transition"
                >
                  Retour à l'accueil
                </button>
              </div>
            )}

            {!feedback && question && !reportedMessage && (
              <>
                <p className="text-xl font-semibold text-center max-w-2xl">
                  “{question.citation}”
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

                {!mode && (
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

                {mode === "2" && (
                  <QuestionBox
                    choices={question.choices.two}
                    onAnswer={(c) => handleAnswer(c, 1)}
                  />
                )}
                {mode === "4" && (
                  <QuestionBox
                    choices={question.choices.all}
                    onAnswer={(c) => handleAnswer(c, 3)}
                  />
                )}

                {mode === "free" && (
                  <div className="flex flex-col gap-2 items-center mt-4">
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
                  </div>
                )}
              </>
            )}

            {reportedMessage && (
              <div className="flex flex-col items-center gap-4 mt-6 text-center">
                <p className="text-lg text-green-600 font-semibold">
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
              </div>
            )}

            {feedback && typeof feedback === "string" && mode !== "end" && (
              <div className="text-2xl font-bold text-center text-green-600 animate-pulse">
                {feedback}
              </div>
            )}

            {feedback &&
              typeof feedback === "object" &&
              feedback.type === "error" && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded shadow max-w-xl text-center">
                  <p className="font-semibold text-lg">{feedback.message}</p>
                  <p className="text-sm mt-2">Essaie la prochaine !</p>
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
}
