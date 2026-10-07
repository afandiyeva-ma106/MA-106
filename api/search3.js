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
      error: "Axtarış mətni yoxdur"
    });
  }

  try {
    const url =
      "https://www.google.com/search?hl=az&num=5&q=" +
      encodeURIComponent('"' + q + '"');

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
      }
    });

    const html = await response.text();

    const sources = [];

    const matches = html.matchAll(
      /https?:\/\/[^"'<> ]+/g
    );

    for (const match of matches) {
      let link = match[0];

      link = link
        .replace(/\\u003d/g, "=")
        .replace(/\\u0026/g, "&");

      if (
        !link.includes("google.com") &&
        !link.includes("gstatic.com") &&
        !sources.includes(link)
      ) {
        sources.push(link);
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
      details: error.message
    });
  }
}
