import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import AddQuestionForm from "../components/AddQuestionForm";
import { useUser } from "../hooks/useUser";
import PageWrapper from "../components/PageWrapper";
const API_BASE = import.meta.env.VITE_API_BASE_URL;

export default function Admin() {
  const [questions, setQuestions] = useState(null);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [editIndex, setEditIndex] = useState(null);
  const [editData, setEditData] = useState(null);
  const { token, user } = useUser();

  const fetchQuestions = useCallback(async () => {
    if (!token || user?.role !== "admin") return;
    try {
      const url =
        filter === "reported"
          ? `${API_BASE}/api/admin/reported`
          : `${API_BASE}/api/admin/questions`;

      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
        params: filter === "all" ? { q: search } : undefined,
      });
      setQuestions(res.data);
    } catch (err) {
      console.error("❌ Erreur chargement questions:", err);
      setQuestions([]);
    }
  }, [search, filter, token, user]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions, user]);

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette question ?")) return;
    try {
      await axios.delete(`${API_BASE}/api/admin/deleteQuestion`, {
        data: { id },
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchQuestions();
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  const handleUnreport = async (question_id) => {
    try {
      await axios.post(
        `${API_BASE}/api/admin/unreport`,
        { question_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchQuestions();
    } catch (err) {
      console.error("Erreur désignalement:", err);
    }
  };

  const handleEdit = (index) => {
    setEditIndex(index);
    setEditData({ ...questions[index] });
  };

  const handleEditChange = (field, value) => {
    setEditData({ ...editData, [field]: value });
  };

  const handleChoiceChange = (i, field, value) => {
    const updatedChoices = [...editData.choices];
    updatedChoices[i][field] = value;
    setEditData({ ...editData, choices: updatedChoices });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(
        `${API_BASE}/api/admin/updateQuestion`,
        {
          id: questions[editIndex].id,
          citation: editData.citation,
          choices: editData.choices,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setEditIndex(null);
      setEditData(null);
      fetchQuestions();
    } catch (err) {
      console.error("Erreur mise à jour:", err);
      alert(
        err.response?.data?.error || "Erreur serveur lors de la mise à jour."
      );
    }
  };

  if (!user || user.role !== "admin") {
    return (
      <p className="text-center p-6 text-red-600">
        Accès restreint aux administrateurs.
      </p>
    );
  }

  return (
    <PageWrapper>
      <div className="p-6 bg-gray-100 min-h-screen py-20">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Admin - Gestion des questions</h1>
          <button
            onClick={() => setFilter(filter === "all" ? "reported" : "all")}
            className="bg-yellow-500 text-white px-3 py-1 rounded"
          >
            {filter === "all" ? "📛 Voir signalées" : "👁 Voir toutes"}
          </button>
        </div>

        {filter === "all" && (
          <input
            type="text"
            placeholder="Rechercher une citation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-4 p-2 rounded w-full border max-w-lg"
          />
        )}

        <AddQuestionForm onQuestionAdded={fetchQuestions} />

        {questions === null ? (
          <p className="text-center text-gray-500">
            Chargement des questions...
          </p>
        ) : questions.length === 0 ? (
          <p className="text-center text-gray-500">Aucune question trouvée.</p>
        ) : (
          <div className="grid gap-6">
            {questions.map((q, i) => (
              <div key={q.id || i} className="bg-white shadow p-4 rounded">
                {editIndex === i ? (
                  <>
                    <input
                      value={editData.citation}
                      onChange={(e) =>
                        handleEditChange("citation", e.target.value)
                      }
                      className="w-full border p-2 mb-2"
                    />
                    {editData.choices.map((c, j) => (
                      <div key={j} className="flex gap-2 mb-1">
                        <input
                          type="text"
                          value={c.text}
                          onChange={(e) =>
                            handleChoiceChange(j, "text", e.target.value)
                          }
                          className="flex-1 border p-1"
                        />
                        <label className="flex items-center gap-1">
                          <input
                            type="checkbox"
                            checked={c.isCorrect}
                            onChange={(e) =>
                              handleChoiceChange(
                                j,
                                "isCorrect",
                                e.target.checked
                              )
                            }
                          />
                          ✔
                        </label>
                      </div>
                    ))}
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={handleUpdate}
                        className="bg-green-600 text-white px-3 py-1 rounded"
                      >
                        ✅ Enregistrer
                      </button>
                      <button
                        onClick={() => {
                          setEditIndex(null);
                          setEditData(null);
                        }}
                        className="bg-gray-400 text-white px-3 py-1 rounded"
                      >
                        ❌ Annuler
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="font-semibold mb-2">
                      "{q.citation}"{" "}
                      {filter === "reported" && (
                        <span className="text-red-500">(signalée)</span>
                      )}
                    </p>
                    <ul className="mb-2 list-disc list-inside">
                      {q.choices.map((c, j) => (
                        <li
                          key={j}
                          className={
                            c.isCorrect ? "text-green-600" : "text-gray-800"
                          }
                        >
                          {c.text} {c.isCorrect && "(✔)"}
                        </li>
                      ))}
                    </ul>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(i)}
                        className="bg-blue-600 text-white px-3 py-1 rounded"
                      >
                        ✏️ Modifier
                      </button>
                      {filter === "reported" && q.question_id ? (
                        <button
                          onClick={() => handleUnreport(q.id)}
                          className="bg-purple-600 text-white px-3 py-1 rounded"
                        >
                          ❌ Désignaler
                        </button>
                      ) : (
                        <button
                          onClick={() => handleDelete(q.id)}
                          className="bg-red-600 text-white px-3 py-1 rounded"
                        >
                          🗑 Supprimer
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
