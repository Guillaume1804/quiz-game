import { useState } from "react";
import axios from "axios";
import { useUser } from "../hooks/useUser";

export default function AddQuestionForm({ onQuestionAdded }) {
  const [citation, setCitation] = useState("");
  const [choices, setChoices] = useState([
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useUser();
  const API_BASE = import.meta.env.VITE_API_BASE_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const hasCorrect = choices.some((c) => c.isCorrect);
    if (!citation || !hasCorrect) {
      setError("Ajoute une citation et au moins une bonne réponse.");
      return;
    }

    try {
      await axios.post(
        `${API_BASE}/api/admin/addQuestion`,
        { citation, choices },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCitation("");
      setChoices([
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ]);
      setSuccess("✅ Question ajoutée !");
      onQuestionAdded();

      // Retire le message au bout de 3 secondes
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || "Erreur ajout question.");
    }
  };

  const handleChoiceChange = (index, field, value) => {
    let updated = [...choices];

    // Optionnel : ne permettre qu'une seule réponse correcte
    if (field === "isCorrect" && value === true) {
      updated = updated.map((c, i) => ({
        ...c,
        isCorrect: i === index,
      }));
    } else {
      updated[index][field] = value;
    }

    setChoices(updated);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mb-8 bg-white p-4 rounded shadow space-y-4"
    >
      <h3 className="text-lg font-bold">➕ Ajouter une nouvelle question</h3>

      <input
        type="text"
        placeholder="Citation"
        value={citation}
        onChange={(e) => setCitation(e.target.value)}
        className="w-full p-2 border rounded"
        required
      />

      {choices.map((c, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={c.text}
            placeholder={`Proposition ${i + 1}`}
            onChange={(e) => handleChoiceChange(i, "text", e.target.value)}
            className="flex-1 p-2 border rounded"
            required
          />
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={c.isCorrect}
              onChange={(e) =>
                handleChoiceChange(i, "isCorrect", e.target.checked)
              }
            />
            ✔
          </label>
        </div>
      ))}

      {error && <p className="text-red-500 text-sm">{error}</p>}
      {success && <p className="text-green-600 text-sm">{success}</p>}

      <button
        type="submit"
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ✅ Ajouter
      </button>
    </form>
  );
}
