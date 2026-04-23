const { put } = require('@vercel/blob');

/* ── Body-size limit: photos can be several MB ── */
const handler = async function (req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  /* Tell the browser how to set up Blob if the env var is missing */
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      setup: true,
      message:
        'In your Vercel dashboard: open this project → Storage tab → ' +
        'Create Database → Blob → give it any name → Connect to Project. ' +
        "Vercel adds the token automatically — then click 'Get Share Link' again."
    });
  }

  const { html } = req.body || {};
  if (!html) return res.status(400).json({ error: 'No html provided' });

  try {
    const blob = await put(`share-${Date.now()}.html`, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

handler.config = {
  api: { bodyParser: { sizeLimit: '25mb' } }
};

module.exports = handler;
