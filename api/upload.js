/* ── api/upload.js ──────────────────────────────
   Uploads a single base64 photo to Vercel Blob.
   Called once per photo — keeps each request small.
─────────────────────────────────────────────── */
const { put } = require('@vercel/blob');

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(503).json({ error: 'Blob not configured' });
  }

  const { dataUrl, filename } = req.body || {};
  if (!dataUrl) return res.status(400).json({ error: 'No dataUrl' });

  /* Parse  "data:image/jpeg;base64,/9j/..." */
  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'Invalid dataUrl' });

  const contentType = m[1];
  const buffer      = Buffer.from(m[2], 'base64');

  try {
    const blob = await put(filename || `photo-${Date.now()}.jpg`, buffer, {
      access: 'public',
      contentType,
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* Each photo after compression is ~200–400 KB — 5 MB is plenty */
handler.config = { api: { bodyParser: { sizeLimit: '5mb' } } };
module.exports = handler;
