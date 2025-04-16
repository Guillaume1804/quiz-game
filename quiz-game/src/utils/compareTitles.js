// ✅ utils/compareTitles.js
import { get as levenshtein } from "fast-levenshtein";

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u00C0-\u017F\s]/gi, "") // enlève les ponctuations
    .replace(/episode\s*(\d+|[ivxlc]+)/gi, "")
    .replace(/\b(le|la|les|un|une|des|de|du|d|l)\b/gi, "") // articles
    .replace(/\s+/g, " ")
    .trim();
}

export function isFreeAnswerCorrect(userInput, correctAnswer) {
  const normUser = normalizeTitle(userInput);
  const normCorrect = normalizeTitle(correctAnswer);

  const dist = levenshtein(normUser, normCorrect);
  const ratio = 1 - dist / Math.max(normUser.length, normCorrect.length);

  if (ratio >= 0.75) return true; // Similarité suffisante

  // Mots-clés communs
  const userWords = new Set(normUser.split(" "));
  const correctWords = new Set(normCorrect.split(" "));

  const commonWords = [...userWords].filter((w) => correctWords.has(w));
  if (commonWords.length >= Math.min(2, correctWords.size)) return true;

  return false;
}
