// ✅ AddQuestionForm.jsx
import { useState } from "react";
import axios from "axios";

export default function AddQuestionForm({ onAdd }) {
  const [citation, setCitation] = useState("");
  const [choices, setChoices] = useState([
    { text: "", isCorrect: true },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (index, value) => {
    const updated = [...choices];
    updated[index].text = value;
    setChoices(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!citation || choices.some((c) => !c.text)) {
      setMessage("Tous les champs doivent être remplis.");
      return;
    }

    setLoading(true);
    try {
      await axios.put("http://localhost:3001/api/admin/updateQuestion", {
        originalCitation: citation,
        updatedQuestion: { citation, choices },
      });
      setMessage("Question ajoutée/modifiée avec succès !");
      setCitation("");
      setChoices([
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      if (onAdd) onAdd();
    } catch (err) {
      console.error("Erreur ajout question :", err);
      setMessage("Erreur lors de l'ajout de la question.");
    }
    setLoading(false);
  };

  return (
    <div className="bg-white text-black p-4 rounded shadow">
      <h2 className="text-lg font-bold mb-2">Ajouter ou modifier une question</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={citation}
          onChange={(e) => setCitation(e.target.value)}
          placeholder="Citation"
          rows={3}
          className="border p-2 rounded"
        />
        {choices.map((c, i) => (
          <input
            key={i}
            type="text"
            value={c.text}
            onChange={(e) => handleChange(i, e.target.value)}
            className={`border p-2 rounded ${c.isCorrect ? "border-green-500" : ""}`}
            placeholder={c.isCorrect ? "Bonne réponse" : "Mauvaise réponse"}
          />
        ))}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Ajout..." : "Ajouter la question"}
        </button>
        {message && <p className="text-sm mt-2 text-center">{message}</p>}
      </form>
    </div>
  );
}
