export default async function handler(req, res) {
  res.status(200).json({
    durum: "Backend çalışıyor!",
    mesaj: "MA-106 API bağlantısı başarılı."
  });
}
