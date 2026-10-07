export default async function handler(req, res) {
  try {
    const q = req.query.q;

    if (!q) {
      return res.status(400).json({
        error: "Axtarış mətni yoxdur"
      });
    }

    const url =
      "https://search.bus-hit.me/search?q=" +
      encodeURIComponent('"' + q + '"') +
      "&format=json&language=az";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Axtarış serveri cavab vermədi");
    }

    const data = await response.json();

    const results = (data.results || []).slice(0, 5).map(item => ({
      title: item.title || "",
      url: item.url || "",
      content: item.content || "",
      source: item.engine || ""
    }));

    return res.status(200).json({
      query: q,
      results
    });

  } catch (error) {
    return res.status(500).json({
      error: "Axtarış zamanı xəta baş verdi"
    });
  }
}
