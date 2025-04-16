// ✅ adminRoutes.js - version modifiée avec signalement via reportedQuestions.json
const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const CLEANED_PATH = path.join(__dirname, "data", "cleanedQuestions.json");
const REPORTED_PATH = path.join(__dirname, "data", "reportedQuestions.json");

function load(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

// 🔍 GET toutes les questions
router.get("/questions", (req, res) => {
  const q = req.query.q?.toLowerCase();
  const questions = load(CLEANED_PATH);

  if (q) {
    const filtered = questions.filter((question) =>
      question.citation.toLowerCase().includes(q)
    );
    return res.json(filtered);
  }

  res.json(questions);
});

// 🚨 GET questions signalées (via fichier à part)
router.get("/reported", (req, res) => {
  const reported = load(REPORTED_PATH);
  res.json(reported);
});

// 🚨 Signaler une question (enregistre la question dans reportedQuestions.json)
router.post("/report", (req, res) => {
  const { citation } = req.body;
  const allQuestions = load(CLEANED_PATH);
  const reported = load(REPORTED_PATH);

  const found = allQuestions.find((q) => q.citation === citation);
  if (!found) return res.status(404).json({ error: "Question non trouvée" });

  const already = reported.some((q) => q.citation === citation);
  if (!already) {
    reported.push(found);
    save(REPORTED_PATH, reported);
  }

  res.json({ success: true });
});

// ✏️ Modifier une question (dans cleanedQuestions.json)
router.put("/updateQuestion", (req, res) => {
  const { originalCitation, updatedQuestion } = req.body;
  const questions = load(CLEANED_PATH);
  const index = questions.findIndex((q) => q.citation === originalCitation);

  if (index === -1) {
    return res.status(404).json({ error: "Question non trouvée" });
  }

  questions[index] = updatedQuestion;
  save(CLEANED_PATH, questions);
  res.json({ success: true });
});

// ❌ Supprimer une question (dans cleanedQuestions.json)
router.delete("/deleteQuestion", (req, res) => {
  const { citation } = req.body;
  const questions = load(CLEANED_PATH);
  const filtered = questions.filter((q) => q.citation !== citation);

  if (filtered.length === questions.length) {
    return res.status(404).json({ error: "Aucune question supprimée" });
  }

  save(CLEANED_PATH, filtered);
  res.json({ success: true });
});

// ❌ Désignaler une question (retirer du fichier reportedQuestions.json)
router.post("/unreport", (req, res) => {
  const { citation } = req.body;
  const reported = load(REPORTED_PATH);
  const filtered = reported.filter((q) => q.citation !== citation);

  if (filtered.length === reported.length) {
    return res.status(404).json({ error: "La question n'était pas signalée." });
  }

  save(REPORTED_PATH, filtered);
  res.json({ success: true });
});

module.exports = router;