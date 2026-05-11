/* ── api/md-upload.js ────────────────────────────
   Uploads a single base64 photo to Vercel Blob.
   Mother's Day site — separate from ms-lopez upload.
─────────────────────────────────────────────── */
const { put } = require('@vercel/blob');

const BLOB_TOKEN = 'vercel_blob_rw_t4wgybeW1HuvMfqo_bxx1vVmLEb11XWvVwEzeKAJmw2kHVE';

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  const { dataUrl, filename } = req.body || {};
  if (!dataUrl) return res.status(400).json({ error: 'No dataUrl' });

  const m = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!m) return res.status(400).json({ error: 'Invalid dataUrl' });

  const contentType = m[1];
  const buffer      = Buffer.from(m[2], 'base64');

  try {
    const blob = await put(filename || `md-photo-${Date.now()}.jpg`, buffer, {
      access: 'public',
      contentType,
      token: BLOB_TOKEN,
    });
    return res.status(200).json({ url: blob.url });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

handler.config = { api: { bodyParser: { sizeLimit: '5mb' } } };
module.exports = handler;
