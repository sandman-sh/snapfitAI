export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const PRAVA_BACKEND = 'https://sandbox.api.prava.space';
  const SECRET_KEY = process.env.PRAVA_SECRET_KEY || 'sk_test_eaf668f6fe78_keOxBdFymVGEx4Q4IF35hheFMpn4OJI8lIP6uDKBgNg';
  const { sessionId } = req.query;

  if (req.method === 'GET') {
    // Poll payment result
    try {
      const response = await fetch(
        `${PRAVA_BACKEND}/v1/sessions/${sessionId}/payment-result?_t=${Date.now()}`,
        {
          headers: { 'Authorization': `Bearer ${SECRET_KEY}` },
        }
      );
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    // Report status
    try {
      const response = await fetch(
        `${PRAVA_BACKEND}/v1/sessions/${sessionId}/report-status`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${SECRET_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(req.body),
        }
      );
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
