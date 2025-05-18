const express = require("express");
const router = express.Router();
const supabase = require("../config/supabaseClient");

// 🔍 GET toutes les questions (avec recherche optionnelle)
router.get("/questions", async (req, res) => {
  const q = req.query.q?.toLowerCase();

  const { data: questions, error } = await supabase
    .from("questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return res.status(500).json({ error });

  if (q) {
    const filtered = questions.filter((question) =>
      question.citation.toLowerCase().includes(q)
    );
    return res.json(filtered);
  }

  res.json(questions);
});

// 🚨 GET questions signalées (avec détails enrichis)
router.get("/reported", async (req, res) => {
  const { data: reports, error: reportError } = await supabase
    .from("reportedQuestions")
    .select("*");

  if (reportError) return res.status(500).json({ error: reportError });

  const { data: questions, error: questionError } = await supabase
    .from("questions")
    .select("*");

  if (questionError) return res.status(500).json({ error: questionError });

  const merged = reports
    .map((report) => {
      const question = questions.find((q) => q.id === report.question_id);
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

  // Vérifie s’il y a déjà un signalement
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

  if (error) return res.status(500).json({ error });

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

  const { error: updateError } = await supabase
    .from("questions")
    .update({ citation, choices })
    .eq("id", id);

  if (updateError) return res.status(500).json({ error: updateError });

  await supabase.from("reportedQuestions").delete().eq("question_id", id);

  res.json({ success: true });
});

// ❌ Supprimer une question
router.delete("/deleteQuestion", async (req, res) => {
  const { id } = req.body;

  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

// ✅ Ajouter une question
router.post("/addQuestion", async (req, res) => {
  const { citation, choices } = req.body;

  if (!citation || !Array.isArray(choices)) {
    return res.status(400).json({ error: "Question invalide." });
  }

  const { data: existing, error: checkError } = await supabase
    .from("questions")
    .select("*")
    .eq("citation", citation)
    .maybeSingle();

  if (checkError) return res.status(500).json({ error: checkError });

  if (existing)
    return res.status(409).json({ error: "Cette citation existe déjà." });

  const { data, error } = await supabase
    .from("questions")
    .insert([{ citation, choices }])
    .select()
    .single();

  if (error) return res.status(500).json({ error });

  res.status(201).json({ success: true, question: data });
});

module.exports = router;
