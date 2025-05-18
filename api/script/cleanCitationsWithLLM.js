require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const INPUT_PATH = path.join(__dirname, "data", "generatedQuestions.json");
const OUTPUT_PATH = path.join(__dirname, "data", "generatedQuestions.json");

const LM_API_URL = "http://127.0.0.1:1234/v1/chat/completions"; // LM Studio

const all = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
const existing = fs.existsSync(OUTPUT_PATH)
  ? JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"))
  : [];

const alreadyDone = new Set(existing.map((q) => q.citation));

function buildPrompt(citation, film) {
    return `
  Tu es un expert en cinéma et ton rôle est de **nettoyer une citation de film sans jamais la reformuler**.
  
  Ta seule tâche est de **remplacer les éléments trop révélateurs du film** (nom de personnage central, titre exact, lieu unique...) par **"???"**, et **uniquement** ces éléments.
  
  ---
  
  📌 Tu dois modifier la citation **SEULEMENT SI** elle contient :
  - le **titre exact du film**
  - un **nom propre de personnage principal** (prénom + nom si possible)
  - un **lieu ou objet spécifique et unique à ce film** (ex : Poudlard, Titanic, Wakanda...)
  
  ❗ Tu dois **laisser intact** :
  - les lieux génériques, noms communs, adjectifs
  - les citations littéraires ou abstraites
  - les émotions, métaphores ou dialogues ambigus
  - les mots qui n’aident **pas directement** à identifier le film
  
  ---
  
  🛠️ Remplace uniquement les mots ou groupes de mots problématiques par **"???"**.
  
  - ⚠️ NE REFORMULE RIEN
  - ⚠️ NE TOUCHE PAS À LA STRUCTURE
  - ⚠️ NE CORRIGE PAS LA LANGUE
  - ⚠️ NE COMMENTE PAS
  - ⚠️ NE RETOURNE PAS UN OBJET JSON
  
  ---
  
  🎬 Citation : "${citation}"
  🎞️ Film : "${film}"
  
  ✂️ Retourne **uniquement** la citation nettoyée, sans guillemets, sans texte autour, sans balise.
  `.trim();
}  

async function cleanCitation(citation, film) {
  const prompt = buildPrompt(citation, film);

  try {
    const res = await axios.post(
      LM_API_URL,
      {
        model: "nous-hermes-2-mistral-7b-dpo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const cleaned = res.data?.choices?.[0]?.message?.content?.trim();

    // 🔎 Vérification du contenu
    if (
      !cleaned ||
      cleaned.length < 5 ||
      cleaned.includes("{") ||
      cleaned.includes("choices") ||
      cleaned.toLowerCase().startsWith("citation nettoyée")
    ) {
      console.warn("⚠️ Réponse ignorée (format invalide) :", cleaned);
      return null;
    }

    return cleaned.replace(/^["']|["']$/g, ""); // Retire guillemets si présents
  } catch (err) {
    console.error("❌ Erreur LLM :", err.message);
    return null;
  }
}

(async () => {
  const results = [...existing];

  for (let i = 0; i < all.length; i++) {
    const { citation, choices } = all[i];
    const film = choices.find((c) => c.isCorrect)?.text;

    if (!film || alreadyDone.has(citation)) {
      console.log(`⏭️ ${i + 1}/${all.length} déjà traité`);
      continue;
    }

    console.log(`🔍 Nettoyage de la citation ${i + 1}/${all.length}`);

    const cleaned = await cleanCitation(citation, film);

    if (cleaned) {
      results.push({
        ...all[i],
        citation: cleaned,
      });

      alreadyDone.add(citation);
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");
      console.log("✅ Citation nettoyée et sauvegardée");
    }

    await new Promise((r) => setTimeout(r, 500)); // petit délai pour éviter surcharge
  }

  console.log(`🎉 Terminé. ${results.length} citations nettoyées.`);
})();
