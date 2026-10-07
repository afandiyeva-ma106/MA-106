export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ sources: [] });
  }

  try {
    const searchUrl =
      "https://freeserp.ai/api.php?index=web&q=" +
      encodeURIComponent(q);

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    const urls = (searchData.results || [])
      .map(item => item.url)
      .filter(Boolean)
      .slice(0, 5);

    const sentenceWords = q
      .toLowerCase()
      .replace(/[.,!?;:()[\]{}"“”]/g, " ")
      .split(/\s+/)
      .filter(word => word.length >= 4);

    const uniqueWords = [...new Set(sentenceWords)];

    const goodSources = [];

    for (const url of urls) {
      try {
        const pageResponse = await fetch(url, {
          headers: {
            "User-Agent": "Mozilla/5.0"
          }
        });

        const html = await pageResponse.text();

        const pageText = html
          .replace(/<script[\s\S]*?<\/script>/gi, " ")
          .replace(/<style[\s\S]*?<\/style>/gi, " ")
          .replace(/<[^>]+>/g, " ")
          .replace(/&nbsp;/gi, " ")
          .replace(/&amp;/gi, "&")
          .replace(/\s+/g, " ")
          .toLowerCase();

        let matches = 0;

        for (const word of uniqueWords) {
          if (pageText.includes(word)) {
            matches++;
          }
        }

        const similarity =
          uniqueWords.length > 0
            ? matches / uniqueWords.length
            : 0;

        if (matches >= 4 && similarity >= 0.45) {
          goodSources.push(url);
        }

        if (goodSources.length >= 2) {
          break;
        }

      } catch (error) {
        // Açılmayan mənbəni keç
      }
    }

    return res.status(200).json({
      query: q,
      sources: goodSources
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      sources: []
    });
  }
}
