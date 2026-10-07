export default async function handler(req, res) {
  const q = req.query.q;

  if (!q) {
    return res.status(400).json({ error: "Axtarış mətni yoxdur" });
  }

  try {
    const url =
      "https://www.google.com/search?q=" +
      encodeURIComponent('"' + q + '"');

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const html = await response.text();

    const links = [...html.matchAll(/https?:\/\/[^"&<> ]+/g)]
      .map(x => x[0])
      .filter(x => !x.includes("google.com"))
      .slice(0, 5);

    return res.status(200).json({
      query: q,
      sources: links
    });

  } catch (error) {
    return res.status(500).json({
      error: "Axtarış alınmadı"
    });
  }
}
