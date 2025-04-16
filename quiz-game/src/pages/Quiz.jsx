// ✅ Quiz.jsx - corrigé pour les invités
import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Score from "../components/Score";
import Lives from "../components/Lives";
import QuestionBox from "../components/QuestionBox";
import { useUser } from "../hooks/useUser";
import { isFreeAnswerCorrect } from "../utils/compareTitles";

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
  const navigate = useNavigate();
  const hasFetchedOnce = useRef(false);
  const inputRef = useRef(null);
  const { user } = useUser();

  const fetchQuestion = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:3001/api/question");
      const newQuestion = res.data;

      if (usedCitations.includes(newQuestion.citation)) {
        fetchQuestion();
        return;
      }

      const correctChoice = newQuestion.choices.find((c) => c.isCorrect);
      const incorrectChoices = newQuestion.choices.filter((c) => !c.isCorrect);
      const randomIncorrect =
        incorrectChoices[Math.floor(Math.random() * incorrectChoices.length)];

      const twoChoices = shuffleArray([correctChoice, randomIncorrect]);
      const shuffledAllChoices = shuffleArray(newQuestion.choices);

      setUsedCitations((prev) => [...prev, newQuestion.citation]);
      setQuestion({
        ...newQuestion,
        choices: {
          all: shuffledAllChoices,
          two: twoChoices,
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
    const token = localStorage.getItem("token");
    const username = user?.username || guestName || "invité_inconnu";
  
    if (!isCorrect && lives - 1 <= 0) {
      alert(`Fin du jeu ! Score final : ${score}`);
  
      try {
        await axios.post(
          "http://localhost:3001/api/score",
          { score, username },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
      } catch (err) {
        console.error("Erreur enregistrement score :", err.message);
      }
  
      if (guestName) {
        localStorage.removeItem("guestName");
        navigate("/login");
      } else {
        navigate("/");
      }
    } else {
      setFeedback(null);
      fetchQuestion();
    }
  };
  
  const handleAnswer = async (choice, points) => {
    const isCorrect = choice.isCorrect;
    const correctAnswer = question.choices.all.find((c) => c.isCorrect)?.text;

    setFeedback(
      isCorrect ? "Bravo !" : `❌ Mauvaise réponse ! C'était : ${correctAnswer}`
    );

    if (isCorrect) {
      setScore((prev) => prev + points);
    } else {
      setLives((prev) => prev - 1);
    }

    setTimeout(() => {
      endTurn(isCorrect);
    }, 2000);
  };

  const handleFreeAnswer = async (userInput) => {
    const correctAnswer = question.choices.all.find((c) => c.isCorrect)?.text;
    if (!correctAnswer) return;

    const isCorrect = isFreeAnswerCorrect(userInput, correctAnswer);

    setFeedback(
      isCorrect ? "Bravo !" : `❌ Mauvaise réponse ! C'était : ${correctAnswer}`
    );

    if (isCorrect) {
      setScore((prev) => prev + 5);
    } else {
      setLives((prev) => prev - 1);
    }

    setTimeout(() => {
      endTurn(isCorrect);
    }, 2000);
  };

  const handleReport = async () => {
    if (!question?.citation) return;
    try {
      await axios.post("http://localhost:3001/api/reportQuestion", {
        citation: question.citation,
      });
      alert("Merci, la question a été signalée.");
    } catch (err) {
      console.error("Erreur lors du signalement :", err);
    }
  };

  useEffect(() => {
    if (mode === "free" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-black text-white p-6 flex flex-col gap-4 items-center justify-center">
      <Score value={score} />
      <Lives count={lives} />

      {loading ? (
        <p>Chargement de la question...</p>
      ) : (
        <>
          {feedback && (
            <div className="text-2xl font-bold mb-4 text-yellow-400 animate-pulse">
              {feedback}
            </div>
          )}

          {!feedback && question && (
            <>
              <p className="text-xl text-center mb-6 max-w-xl">
                {question.citation}
              </p>

              <button
                onClick={handleReport}
                className="text-sm text-red-400 underline mb-4"
              >
                Signaler cette question
              </button>

              {!mode && (
                <div className="flex flex-col items-center gap-4">
                  <h2 className="text-lg">Comment veux-tu répondre ?</h2>
                  <button
                    onClick={() => setMode("2")}
                    className="bg-blue-500 px-4 py-2 rounded"
                  >
                    2 choix (1 point)
                  </button>
                  <button
                    onClick={() => setMode("4")}
                    className="bg-green-500 px-4 py-2 rounded"
                  >
                    4 choix (3 points)
                  </button>
                  <button
                    onClick={() => setMode("free")}
                    className="bg-purple-500 px-4 py-2 rounded"
                  >
                    Réponse libre (5 points)
                  </button>
                </div>
              )}

              {mode === "2" && (
                <QuestionBox
                  citation=""
                  choices={question.choices.two}
                  onAnswer={(choice) => handleAnswer(choice, 1)}
                />
              )}

              {mode === "4" && (
                <QuestionBox
                  citation=""
                  choices={question.choices.all}
                  onAnswer={(choice) => handleAnswer(choice, 3)}
                />
              )}

              {mode === "free" && (
                <div className="flex flex-col gap-4 items-center">
                  <input
                    ref={inputRef}
                    type="text"
                    placeholder="Tape ta réponse ici..."
                    className="p-2 rounded text-black"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const userInput = inputRef.current.value.trim();
                        if (userInput) {
                          handleFreeAnswer(userInput);
                          inputRef.current.value = "";
                        }
                      }
                    }}
                  />
                  <p className="text-sm text-gray-400">
                    Appuie sur Entrée pour valider
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}