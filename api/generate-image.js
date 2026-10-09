export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  // Parse request body
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: 'Invalid JSON request body.' });
    }
  }

  const { prompt, size } = body || {};

  if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
    return res.status(400).json({ error: 'Prompt is required and must be a non-empty string.' });
  }

  // Read secret API key from environment variable ONLY (never logged)
  const apiKey = process.env.ARK_API_KEY || process.env.SEEDANCE_API_KEY;

  if (!apiKey) {
    return res.status(500).json({
      error: 'ARK_API_KEY is not configured in the Vercel environment.'
    });
  }

  const baseUrl = (process.env.SEEDANCE_BASE_URL || 'https://ark.ap-southeast.bytepluses.com/api/v3').replace(/\/+$/, '');
  const model = process.env.SEEDREAM_IMAGE_MODEL || 'seedream-5-0-pro';

  try {
    const payload = {
      model,
      prompt: prompt.trim(),
      size: size || '1024x1024',
      response_format: 'url'
    };

    const response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });

    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMessage =
        responseData?.error?.message ||
        responseData?.message ||
        `BytePlus Seedream API responded with status ${response.status}`;
      return res.status(response.status).json({
        error: errorMessage,
        providerStatus: response.status
      });
    }

    const imageUrl =
      responseData?.data?.[0]?.url ||
      responseData?.outputUrl ||
      responseData?.url;

    return res.status(200).json({
      success: true,
      url: imageUrl,
      data: responseData
    });
  } catch (err) {
    return res.status(500).json({
      error: `Serverless function execution failed: ${err.message}`
    });
  }
};
