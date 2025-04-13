const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const path = require("path");

const BASE_URL = "https://citations.ouest-france.fr/citations-de-films";
const TOTAL_PAGES = 113;
const citations = [];

async function scrapePage(page) {
  const url = page === 1 ? BASE_URL : `${BASE_URL}?page=${page}`;
  console.log(`🟡 Scraping : ${url}`);

  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);

    $("li blockquote a").each((_, element) => {
      const citation = $(element).text().trim();
      const film = $(element)
        .closest("li")
        .find('a[title^="Citations film"]')
        .text()
        .replace(/^film\s+/i, "")
        .trim();

      if (citation && film) {
        citations.push({ citation, film });
      }
    });
  } catch (err) {
    console.error(`❌ Erreur sur ${url}`, err.message);
  }
}

(async () => {
  for (let page = 1; page <= TOTAL_PAGES; page++) {
    await scrapePage(page);
    await new Promise((r) => setTimeout(r, 3000)); // pause 3s pour être plus respectueux
  }

  const outputPath = path.join(__dirname, "data", "scrapedCitations.json");
  fs.writeFileSync(outputPath, JSON.stringify(citations, null, 2), "utf-8");

  console.log(
    `✅ Données enregistrées dans ${outputPath} (${citations.length} citations)`
  );
})();