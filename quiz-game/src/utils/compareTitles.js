import { get as levenshtein } from "fast-levenshtein";

function normalizeTitle(title) {
  return title
    .toLowerCase()
    .normalize("NFD") // supprime accents
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/gi, "") // enlève ponctuation
    .replace(/episode\s*(\d+|[ivxlc]+)/gi, "")
    .replace(/\b(le|la|les|un|une|des|de|du|d|l|the|a|an)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function isFreeAnswerCorrect(userInput, correctAnswer) {
  const normUser = normalizeTitle(userInput);
  const normCorrect = normalizeTitle(correctAnswer);

  // 1. Similarité Levenshtein
  const dist = levenshtein(normUser, normCorrect);
  const maxLen = Math.max(normUser.length, normCorrect.length);
  const ratio = 1 - dist / maxLen;

  if (ratio >= 0.7) return true;

  // 2. Contenu partiel
  if (normCorrect.includes(normUser) || normUser.includes(normCorrect)) return true;

  // 3. Mots-clés communs
  const userWords = new Set(normUser.split(" "));
  const correctWords = new Set(normCorrect.split(" "));

  const commonWords = [...userWords].filter((w) => correctWords.has(w));
  if (commonWords.length >= 2) return true;

  return false;
}
