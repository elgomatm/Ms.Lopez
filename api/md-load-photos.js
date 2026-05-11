/* ── api/md-load-photos.js ───────────────────────
   Returns the saved slot→blobUrl manifest so the
   browser can restore photos on every page load.
─────────────────────────────────────────────── */
const { list } = require('@vercel/blob');

const BLOB_TOKEN = 'vercel_blob_rw_t4wgybeW1HuvMfqo_bxx1vVmLEb11XWvVwEzeKAJmw2kHVE';

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'GET only' });

  try {
    const { blobs } = await list({ prefix: 'md-photos-manifest', limit: 1, token: BLOB_TOKEN });
    if (!blobs.length) return res.status(200).json({ photos: {} });

    const r = await fetch(blobs[0].url + `?t=${Date.now()}`);
    if (!r.ok) return res.status(200).json({ photos: {} });

    const photos = await r.json();
    return res.status(200).json({ photos });
  } catch (_) {
    return res.status(200).json({ photos: {} });
  }
};

module.exports = handler;
