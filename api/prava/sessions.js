export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const PRAVA_BACKEND = 'https://sandbox.api.prava.space';
  const SECRET_KEY = process.env.PRAVA_SECRET_KEY || 'sk_test_eaf668f6fe78_keOxBdFymVGEx4Q4IF35hheFMpn4OJI8lIP6uDKBgNg';

  try {
    const response = await fetch(`${PRAVA_BACKEND}/v1/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
