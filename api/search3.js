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

    const response = await fetch(searchUrl);
    const data = await response.json();

    const sources = (data.results || [])
      .map(item => item.url)
      .filter(Boolean)
      .slice(0, 5);

    return res.status(200).json({
      query: q,
      sources: sources
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      sources: []
    });
  }
}
