const fs = require("fs");
const path = require("path");

const FILE_PATH = path.join(__dirname, "../data", "generatedQuestions.json");
const TEMP_PATH = path.join(__dirname, "../data", "generatedQuestions_temp.json");

if (!fs.existsSync(FILE_PATH)) {
  console.error("❌ Fichier introuvable :", FILE_PATH);
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(FILE_PATH, "utf-8"));

// Étape 1 : génération des nouveaux objets avec ID numériques auto-incrémentés
const updated = questions.map((q, index) => ({
  id: index + 1, // ID numérique simple
  ...q,
}));

// Étape 2 : écriture dans un fichier temporaire
fs.writeFileSync(TEMP_PATH, JSON.stringify(updated, null, 2), "utf-8");

console.log(
  `✅ ${updated.length} questions avec ID sauvegardées temporairement.`
);

// Étape 3 : remplacement propre du fichier original
fs.renameSync(TEMP_PATH, FILE_PATH);
console.log(`📁 Fichier final mis à jour : ${FILE_PATH}`);