export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ sources: [] });
  }

  try {
    const url =
      "https://freeserp.ai/api.php?index=web&q=" +
      encodeURIComponent('"' + q + '"');

    const response = await fetch(url);
    const data = await response.json();

    const sources = (data.results || [])
      .map(x => x.url)
      .filter(Boolean)
      .slice(0, 5);

    return res.status(200).json({
      query: q,
      sources
    });

  } catch (error) {
    return res.status(500).json({
      error: error.message,
      sources: []
    });
  }
}
