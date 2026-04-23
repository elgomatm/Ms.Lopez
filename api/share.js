/* ── api/share.js ───────────────────────────────
   Stores the final (lightweight) HTML in Vercel
   Blob and returns a permanent public URL.
   Photos are already uploaded as separate blobs
   so this payload is just markup — always small.
─────────────────────────────────────────────── */
const { put } = require('@vercel/blob');

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({
      setup: true,
      message:
        'Open your Vercel dashboard → your project → Storage tab → ' +
        'Create Database → Blob → give it any name → Connect to Project. ' +
        "Then click 'Get Share Link' again."
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

/* HTML without base64 photos is < 100 KB */
handler.config = { api: { bodyParser: { sizeLimit: '2mb' } } };
module.exports = handler;
