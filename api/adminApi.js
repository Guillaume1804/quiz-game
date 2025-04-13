// ✅ BACKEND EXPRESS POUR GESTION ADMIN ET SIGNALEMENT
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_PATH = path.join(__dirname, "data", "generatedQuestions.json");

function loadQuestions() {
  if (!fs.existsSync(DATA_PATH)) return [];
  return JSON.parse(fs.readFileSync(DATA_PATH, "utf-8"));
}

function saveQuestions(questions) {
  fs.writeFileSync(DATA_PATH, JSON.stringify(questions, null, 2), "utf-8");
}

// 🔍 GET toutes les questions (optionnellement filtrées par recherche)
app.get("/api/questions", (req, res) => {
  const q = req.query.q?.toLowerCase();
  const questions = loadQuestions();

  if (q) {
    const filtered = questions.filter((question) =>
      question.citation.toLowerCase().includes(q)
    );
    return res.json(filtered);
  }

  res.json(questions);
});

// 🚨 Signaler une question (ajoute "reported": true)
app.post("/api/report", (req, res) => {
  const { citation } = req.body;
  const questions = loadQuestions();
  const index = questions.findIndex((q) => q.citation === citation);

  if (index === -1) {
    return res.status(404).json({ error: "Question non trouvée" });
  }

  questions[index].reported = true;
  saveQuestions(questions);
  res.json({ success: true });
});

// ✏️ Mettre à jour une question (modification manuelle)
app.put("/api/updateQuestion", (req, res) => {
  const { originalCitation, updatedQuestion } = req.body;
  const questions = loadQuestions();
  const index = questions.findIndex((q) => q.citation === originalCitation);

  if (index === -1) {
    return res.status(404).json({ error: "Question à modifier non trouvée" });
  }

  questions[index] = updatedQuestion;
  saveQuestions(questions);
  res.json({ success: true });
});

// ❌ Supprimer une question
app.delete("/api/deleteQuestion", (req, res) => {
  const { citation } = req.body;
  const questions = loadQuestions();
  const filtered = questions.filter((q) => q.citation !== citation);

  if (filtered.length === questions.length) {
    return res.status(404).json({ error: "Aucune question supprimée" });
  }

  saveQuestions(filtered);
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur admin disponible sur http://localhost:${PORT}`);
});
