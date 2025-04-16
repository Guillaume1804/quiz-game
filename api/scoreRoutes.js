const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");
const verifyToken = require("./authMiddleware");

const SCORES_PATH = path.join(__dirname, "data", "scores.json");

function loadScores() {
  if (!fs.existsSync(SCORES_PATH)) return [];
  return JSON.parse(fs.readFileSync(SCORES_PATH, "utf-8"));
}

function saveScores(scores) {
  fs.writeFileSync(SCORES_PATH, JSON.stringify(scores, null, 2), "utf-8");
}

// POST /api/score → enregistrer un score (auth ou invité)
router.post("/", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  let username = req.body.username;
  const score = req.body.score;

  if (typeof score !== "number") {
    return res.status(400).json({ error: "Score invalide." });
  }

  try {
    if (token) {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "secret123");
      username = decoded.username;
    }
  } catch (err) {
    // Pas grave, on continue avec le nom fourni dans le body (invité)
  }

  if (!username) {
    return res.status(400).json({ error: "Nom utilisateur requis." });
  }

  const scores = loadScores();
  scores.push({
    username,
    score,
    date: new Date().toISOString(),
  });

  saveScores(scores);
  res.json({ success: true });
});


// GET /api/score → top 100
router.get("/", (req, res) => {
  const scores = loadScores()
    .sort((a, b) => b.score - a.score)
    .slice(0, 100);
  res.json(scores);
});

module.exports = router;
