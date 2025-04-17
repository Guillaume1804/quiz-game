require("dotenv").config();
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const citationsPath = path.join(__dirname, "data", "scrapedCitations.json");
const outputPath = path.join(__dirname, "data", "generatedQuestions.json");

const citations = JSON.parse(fs.readFileSync(citationsPath, "utf-8"));
const existingQuestions = fs.existsSync(outputPath)
  ? JSON.parse(fs.readFileSync(outputPath, "utf-8"))
  : [];

const alreadyDone = new Set(existingQuestions.map((q) => q.citation));

const LOCAL_LLM_API_URL = "http://127.0.0.1:1234/v1/chat/completions";
const TMDB_API_KEY = process.env.TMDB_API_KEY;

const BASE_PROMPT = (citation, film, badTitles) => `
Tu es une IA experte en cinéma.

Voici une citation culte PRONONCÉE à l'écran : "${citation}"

Elle vient du film : "${film}"

Ta mission est de formater une question de quiz sous ce format JSON STRICT :
{
  "citation": "La citation exacte",
  "choices": [
    { "text": "Titre EXACT du bon film", "isCorrect": true },
    { "text": "Film connu mais incorrect", "isCorrect": false },
    { "text": "Film connu mais incorrect", "isCorrect": false },
    { "text": "Film connu mais incorrect", "isCorrect": false }
  ]
}

IMPORTANT :
- N'invente jamais de citation ou de film.
- Les mauvais films doivent EXISTer et être crédibles (même genre, même époque si possible).
- Les titres doivent tous être en FRANÇAIS.
- Les mauvais films sont à choisir parmi cette liste : ${badTitles.join(", ")}
- N'ajoute pas d'explication ni de texte avant ou après le JSON.

Génère maintenant ce JSON :
`;

async function fetchWithRateLimitCheck(url, options = {}) {
  try {
    const response = await axios.get(url, options);
    return response;
  } catch (err) {
    if (err.response?.status === 429) {
      console.error(
        "❌ Limite journalière TMDB atteinte (Erreur 429). Arrêt du script."
      );
      process.exit(1);
    } else {
      console.error("❌ Erreur TMDB :", err.message);
      throw err;
    }
  }
}

async function searchFilmByTitle(title) {
  const baseURL = "https://api.themoviedb.org/3/search/movie";
  const paramsFr = { query: title, api_key: TMDB_API_KEY, language: "fr-FR" };
  const paramsNoLang = { query: title, api_key: TMDB_API_KEY };

  let res = await fetchWithRateLimitCheck(baseURL, { params: paramsFr });
  if (!res.data.results.length) {
    res = await fetchWithRateLimitCheck(baseURL, { params: paramsNoLang });
  }

  return res.data.results[0] || null;
}

async function getSimilarMovies(originalMovieId, genreIds) {
  const url = `https://api.themoviedb.org/3/movie/${originalMovieId}/recommendations`;
  try {
    const res = await fetchWithRateLimitCheck(url, {
      params: {
        api_key: TMDB_API_KEY,
        language: "fr-FR",
      },
    });

    const recommendations = res.data.results.filter(
      (m) =>
        m.title && !m.adult && genreIds.some((g) => m.genre_ids.includes(g))
    );

    return recommendations.map((m) => m.title).slice(0, 10);
  } catch (err) {
    return [];
  }
}

async function generateQuestion(citation, film) {
  const found = await searchFilmByTitle(film);
  if (!found) {
    console.warn("❌ Film introuvable :", film);
    return null;
  }

  let badTitles = await getSimilarMovies(found.id, found.genre_ids);

  if (badTitles.length < 3) {
    console.warn(
      "⚠️ Trop peu de recommandations. Fallback sur films populaires."
    );
    const fallback = await fetchWithRateLimitCheck(
      "https://api.themoviedb.org/3/movie/popular",
      {
        params: { api_key: TMDB_API_KEY, language: "fr-FR", page: 1 },
      }
    );
    badTitles = fallback.data.results
      .filter((m) => m.title !== found.title)
      .map((m) => m.title)
      .slice(0, 10);
  }

  const prompt = BASE_PROMPT(citation, film, badTitles.slice(0, 10));

  try {
    const res = await axios.post(
      LOCAL_LLM_API_URL,
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

    const choices = res.data?.choices;
    if (!choices || !choices[0]?.message?.content) {
      console.error(
        "❌ Réponse inattendue :",
        JSON.stringify(res.data, null, 2)
      );
      return null;
    }

    const text = choices[0].message.content;
    const match = text.match(/\{\s*"citation":.*?"choices":\s*\[.*?\]\s*\}/s);
    if (!match) {
      console.error("❌ Réponse IA non conforme :", text.slice(0, 200));
      return null;
    }

    return JSON.parse(match[0]);
  } catch (err) {
    console.error(
      "❌ Erreur API locale :",
      citation.slice(0, 80),
      "-",
      err.message
    );
    return null;
  }
}

(async () => {
  const results = [...existingQuestions];

  for (let i = 0; i < citations.length; i++) {
    const { citation, film } = citations[i];

    if (alreadyDone.has(citation)) {
      console.log(`⏭️ ${i + 1}/${citations.length} (déjà traité)`);
      continue;
    }

    console.log(
      `⏳ ${i + 1}/${citations.length} → "${citation.slice(0, 50)}..."`
    );

    const question = await generateQuestion(citation, film);
    if (question) {
      results.push(question);
      alreadyDone.add(citation);
      fs.writeFileSync(outputPath, JSON.stringify(results, null, 2), "utf-8");
      console.log("✅ Question ajoutée.");
    }

    await new Promise((r) => setTimeout(r, 500));
  }

  console.log(`🎉 Terminé. ${results.length} questions générées avec succès.`);
})();