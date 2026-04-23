/* ── api/load-photos.js ─────────────────────────
   Returns the saved slot→blobUrl manifest so the
   browser can restore photos on every page load.
─────────────────────────────────────────────── */
const { list } = require('@vercel/blob');

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET')    return res.status(405).json({ error: 'GET only' });

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(200).json({ photos: {} });
  }

  try {
    const { blobs } = await list({ prefix: 'photos-manifest', limit: 1 });
    if (!blobs.length) return res.status(200).json({ photos: {} });

    /* Cache-bust so we always get the latest manifest */
    const r = await fetch(blobs[0].url + `?t=${Date.now()}`);
    if (!r.ok) return res.status(200).json({ photos: {} });

    const photos = await r.json();
    return res.status(200).json({ photos });
  } catch (err) {
    /* Never crash the page — just return empty */
    return res.status(200).json({ photos: {} });
  }
};

module.exports = handler;
