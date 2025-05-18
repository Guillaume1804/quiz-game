// ✅ migrateQuestions.js (version CommonJS)
const fs = require("fs");
const path = require("path");
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const filePath = path.join(__dirname, "..", "data", "generatedQuestions.json");

async function migrate() {
  const raw = fs.readFileSync(filePath, "utf-8");
  const questions = JSON.parse(raw);

  for (const q of questions) {
    const { citation, choices } = q;

    const { error } = await supabase.from("questions").insert([
      {
        citation,
        choices,
      },
    ]);

    if (error) {
  console.error("❌ Erreur insertion :", JSON.stringify(error, null, 2));
} else {
      console.log("✅ Question insérée :", citation);
    }
  }
}

migrate();
