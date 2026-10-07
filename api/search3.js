export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const q = req.query.q;

  if (!q) {
    return res.status(400).json({
      error: "Axtarış mətni yoxdur",
      sources: []
    });
  }

  try {
    const url =
      "https://html.duckduckgo.com/html/?q=" +
      encodeURIComponent('"' + q + '"');

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
        "Accept-Language": "az-AZ,az;q=0.9,en;q=0.8"
      }
    });

    const html = await response.text();

    const sources = [];

    const regex =
      /class="result__a"[^>]*href="([^"]+)"/gi;

    let match;

    while ((match = regex.exec(html)) !== null) {
      let link = match[1];

      link = link.replace(/&amp;/g, "&");

      if (
        link.startsWith("http") &&
        !link.includes("duckduckgo.com")
      ) {
        if (!sources.includes(link)) {
          sources.push(link);
        }
      }

      if (sources.length >= 5) break;
    }

    return res.status(200).json({
      query: q,
      sources: sources
    });

  } catch (error) {
    return res.status(500).json({
      error: "Axtarış alınmadı",
      sources: []
    });
  }
}
