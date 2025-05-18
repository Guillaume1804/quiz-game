const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");
const path = require("path");
const fs = require("fs");

const CLEANED_PATH = path.join(__dirname, "../data/generatedQuestions.json");

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

// 🚨 GET questions signalées (détails enrichis)
router.get("/reported", async (req, res) => {
  const { data: reports, error } = await supabase
    .from("reportedQuestions")
    .select("*");
  if (error) return res.status(500).json({ error });

  const allQuestions = load(CLEANED_PATH);

  const merged = reports
    .map((report) => {
      const question = allQuestions.find((q) => q.id === report.question_id);
      if (!question) return null;
      return {
        ...question,
        question_id: report.id,
        reported_by: report.reported_by,
        reported_at: report.reported_at,
      };
    })
    .filter(Boolean);

  res.json(merged);
});

// 🚨 Signaler une question
router.post("/report", async (req, res) => {
  const { question_id, reported_by } = req.body;

  if (!question_id || isNaN(Number(question_id))) {
    return res.status(400).json({ error: "ID de question invalide." });
  }

  // Vérifie s’il y a déjà un signalement pour cette question
  let existing, fetchError;

  if (reported_by) {
    ({ data: existing, error: fetchError } = await supabase
      .from("reportedQuestions")
      .select("*")
      .eq("question_id", question_id)
      .eq("reported_by", reported_by)
      .single());
  } else {
    ({ data: existing, error: fetchError } = await supabase
      .from("reportedQuestions")
      .select("*")
      .eq("question_id", question_id)
      .is("reported_by", null)
      .single());
  }

  if (fetchError && fetchError.code !== "PGRST116") {
    return res.status(500).json({ error: "Erreur lors de la vérification." });
  }

  if (existing) {
    return res.status(409).json({ error: "Cette question est déjà signalée." });
  }

  const { error } = await supabase.from("reportedQuestions").insert({
    question_id,
    reported_by: reported_by || null,
  });

  if (error) {
    console.error("Erreur insertion Supabase :", error);
    return res.status(500).json({ error });
  }

  res.json({ success: true });
});

// ❌ Désignaler une question
router.post("/unreport", async (req, res) => {
  const { question_id } = req.body;

  const { error } = await supabase
    .from("reportedQuestions")
    .delete()
    .eq("question_id", question_id);

  if (error) return res.status(500).json({ error });
  res.json({ success: true });
});

// ✏️ Modifier une question + désignalement automatique
router.put("/updateQuestion", async (req, res) => {
  const { id, citation, choices } = req.body;

  if (!id || !citation || !Array.isArray(choices)) {
    return res
      .status(400)
      .json({ error: "Champs requis manquants ou invalides." });
  }

  const questions = load(CLEANED_PATH);
  const index = questions.findIndex((q) => q.id === id);

  if (index === -1)
    return res.status(404).json({ error: "Question non trouvée." });

  questions[index] = { id, citation, choices };
  save(CLEANED_PATH, questions);

  // Désignalement automatique
  await supabase.from("reportedQuestions").delete().eq("question_id", id);

  res.json({ success: true });
});

// ❌ Supprimer une question par ID
router.delete("/deleteQuestion", (req, res) => {
  const { id } = req.body;
  const questions = load(CLEANED_PATH);
  const filtered = questions.filter((q) => q.id !== id);

  if (filtered.length === questions.length)
    return res.status(404).json({ error: "Aucune question supprimée" });

  save(CLEANED_PATH, filtered);
  res.json({ success: true });
});

// ✅ Ajouter une question
router.post("/addQuestion", async (req, res) => {
  const question = req.body;

  if (!question?.citation || !Array.isArray(question?.choices)) {
    return res.status(400).json({ error: "Question invalide." });
  }

  let questions = load(CLEANED_PATH);

  const alreadyExists = questions.some((q) => q.citation === question.citation);
  if (alreadyExists) {
    return res.status(409).json({ error: "Cette citation existe déjà." });
  }

  const newQuestion = {
    ...question,
    id: Date.now(),
  };

  questions.push(newQuestion);
  save(CLEANED_PATH, questions);

  res.status(201).json({ success: true, question: newQuestion });
});

module.exports = router;
