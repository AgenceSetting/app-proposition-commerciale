/**
 * Agence Setting — Proxy API Anthropic
 * Vercel Serverless Function
 * La clé API est stockée dans les variables d'environnement Vercel (jamais exposée au client)
 */
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { system, user } = req.body;

  if (!system || !user) {
    return res.status(400).json({ error: 'Missing system or user prompt' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: user }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || 'Erreur API Anthropic'
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error('Erreur proxy:', error);
    return res.status(500).json({ error: 'Erreur serveur interne: ' + error.message });
  }
}
