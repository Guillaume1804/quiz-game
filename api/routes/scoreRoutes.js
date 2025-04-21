const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const supabase = require("../config/supabaseClient");

// POST : Enregistrer un score (auth ou invité)
router.post("/", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let user_id = null;
  const score = req.body.score;

  if (typeof score !== "number") {
    return res.status(400).json({ error: "Score invalide." });
  }

  try {
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      user_id = decoded.id;
    }
  } catch {}

  const { error } = await supabase.from("scores").insert({
    user_id,
    score,
  });

  if (error) return res.status(500).json({ error });

  res.json({ success: true });
});

// GET : Top 100 scores
router.get("/", async (req, res) => {
  const { data, error } = await supabase
    .from("scores")
    .select("score, user_id, users(username)") // 👈 jointure vers users
    .order("score", { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error });

  // 👇 transformer les résultats pour éviter users: {username} à l'affichage
  const result = data.map((item) => ({
    score: item.score,
    username: item.users?.username || "Anonyme",
  }));

  res.json(result);
});

module.exports = router;
