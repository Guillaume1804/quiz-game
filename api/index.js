require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const scoreRoutes = require("./routes/scoreRoutes");
const adminRoutes = require("./routes/adminRoutes");
const supabase = require("./config/supabaseClient");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/score", scoreRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/question", async (req, res) => {
  const { data: questions, error } = await supabase
    .from("questions")
    .select("*");

  if (error || !questions || questions.length === 0) {
    return res.status(404).json({ error: "Aucune question disponible." });
  }

  const validQuestions = questions.filter(
    (q) => q?.citation && Array.isArray(q.choices)
  );
  if (!validQuestions.length)
    return res
      .status(404)
      .json({ error: "Pas de questions valides disponibles." });

  const random =
    validQuestions[Math.floor(Math.random() * validQuestions.length)];
  res.json(random);
});

app.listen(PORT, () => {
  console.log(`✅ API en ligne sur ${PORT}`);
});
