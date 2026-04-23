/* ── api/save-photos.js ─────────────────────────
   Persists the slot→blobUrl manifest to Vercel
   Blob so photos survive deployments and browser
   clears. addRandomSuffix:false means each save
   overwrites the same file at the same URL.
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

  const { photos } = req.body || {};
  if (!photos || typeof photos !== 'object') {
    return res.status(400).json({ error: 'No photos object provided' });
  }

  try {
    const blob = await put('photos-manifest.json', JSON.stringify(photos), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,   /* same URL every save — overwrites in place */
    });
    return res.status(200).json({ url: blob.url, count: Object.keys(photos).length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

/* Manifest is just URLs, never base64 — always tiny */
handler.config = { api: { bodyParser: { sizeLimit: '64kb' } } };
module.exports = handler;
