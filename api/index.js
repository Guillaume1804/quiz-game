require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const authRoutes = require("./authRoutes");
const scoreRoutes = require("./scoreRoutes");
const verifyToken = require("./authMiddleware");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);

const QUESTIONS_PATH = path.join(__dirname, "data", "generatedQuestions.json");
const REPORTED_PATH = path.join(__dirname, "data", "reportedQuestions.json");
const USERS_PATH = path.join(__dirname, "data", "users.json");

function load(file) {
  if (!fs.existsSync(file)) return [];
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}
function save(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");
}

app.get("/api/question", (req, res) => {
  const questions = load(QUESTIONS_PATH);
  if (!questions.length)
    return res.status(404).json({ error: "Aucune question disponible." });
  const random = questions[Math.floor(Math.random() * questions.length)];
  res.json(random);
});

app.post("/api/reportQuestion", (req, res) => {
  const { citation } = req.body;
  if (!citation) return res.status(400).json({ error: "Citation manquante." });
  const questions = load(QUESTIONS_PATH);
  const reported = load(REPORTED_PATH);
  const found = questions.find((q) => q.citation === citation);
  if (!found) return res.status(404).json({ error: "Introuvable" });
  if (!reported.some((q) => q.citation === citation)) {
    reported.push(found);
    save(REPORTED_PATH, reported);
  }
  res.json({ success: true });
});

app.get("/api/reportedQuestions", verifyToken, (req, res) => {
  res.json(load(REPORTED_PATH));
});

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur http://localhost:${PORT}`);
});
