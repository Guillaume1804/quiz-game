require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");

const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/admin", adminRoutes);

// GET /api/question → question aléatoire depuis fichier local
const QUESTIONS_PATH = path.join(__dirname, "data", "cleanedQuestions.json");

function load(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

app.get("/api/question", (req, res) => {
  const questions = load(QUESTIONS_PATH);
  if (!questions.length)
    return res.status(404).json({ error: "Aucune question disponible." });
  const random = questions[Math.floor(Math.random() * questions.length)];
  res.json(random);
});

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur ${PORT}`);
});
