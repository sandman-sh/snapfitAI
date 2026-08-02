import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const PRAVA_BACKEND = 'https://sandbox.api.prava.space';
const SECRET_KEY = process.env.PRAVA_SECRET_KEY || 'sk_test_eaf668f6fe78_keOxBdFymVGEx4Q4IF35hheFMpn4OJI8lIP6uDKBgNg';

// Create session
app.post('/api/prava/sessions', async (req, res) => {
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
});

// GET /api/prava/:sessionId → Poll payment result
app.get('/api/prava/:sessionId', async (req, res) => {
  try {
    const response = await fetch(
      `${PRAVA_BACKEND}/v1/sessions/${req.params.sessionId}/payment-result?_t=${Date.now()}`,
      { headers: { 'Authorization': `Bearer ${SECRET_KEY}` } }
    );
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prava/:sessionId → Report status
app.post('/api/prava/:sessionId', async (req, res) => {
  try {
    const response = await fetch(
      `${PRAVA_BACKEND}/v1/sessions/${req.params.sessionId}/report-status`,
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
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`✅ Prava proxy server running on http://localhost:${PORT}`);
  console.log(`   Proxying to ${PRAVA_BACKEND}`);
});
