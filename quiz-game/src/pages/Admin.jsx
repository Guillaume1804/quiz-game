import { useEffect, useState } from "react";
import axios from "axios";

export default function Admin() {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await axios.get("http://localhost:3001/api/pendingQuestions");
      setQuestions(res.data);
    } catch (err) {
      console.error("Erreur de chargement des questions :", err);
    }
  };

  const handleValidate = async (index) => {
    try {
      const question = questions[index];
      await axios.post("http://localhost:3001/api/validateQuestion", question);
      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    } catch (err) {
      console.error("Erreur de validation :", err);
    }
  };

  const handleReject = async (index) => {
    try {
      await axios.post("http://localhost:3001/api/deleteQuestion", {
        citation: questions[index].citation,
      });
      const updated = [...questions];
      updated.splice(index, 1);
      setQuestions(updated);
    } catch (err) {
      console.error("Erreur de suppression :", err);
    }
  };

  const handleGenerateBatch = async () => {
    try {
      const res = await axios.post("http://localhost:3001/api/generateBatch");
      alert(`${res.data.added} nouvelles questions ont été générées.`);
      fetchPending(); // Recharge la liste
    } catch (err) {
      console.error("Erreur génération batch :", err);
      alert("Erreur lors de la génération.");
    }
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="mb-6">
        <button
          onClick={handleGenerateBatch}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          🧠 Générer 20 questions IA
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">Validation des questions IA</h1>
      {questions.length === 0 ? (
        <p className="text-gray-500">Aucune question en attente.</p>
      ) : (
        <div className="grid gap-6">
          {questions.map((q, i) => (
            <div key={i} className="bg-white shadow p-4 rounded">
              <p className="font-semibold mb-2">"{q.citation}"</p>
              <ul className="mb-2 list-disc list-inside">
                {q.choices.map((c, j) => (
                  <li
                    key={j}
                    className={c.isCorrect ? "text-green-600" : "text-gray-800"}
                  >
                    {c.text} {c.isCorrect && "(✔️)"}
                  </li>
                ))}
              </ul>
              <div className="flex gap-4">
                <button
                  onClick={() => handleValidate(i)}
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                >
                  ✅ Valider
                </button>
                <button
                  onClick={() => handleReject(i)}
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                >
                  ❌ Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
