const { put } = require('@vercel/blob');

process.env.BLOB_READ_WRITE_TOKEN =
  process.env.BLOB_READ_WRITE_TOKEN ||
  'vercel_blob_rw_t4wgybeW1HuvMfqo_bxx1vVmLEb11XWvVwEzeKAJmw2kHVE';

const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')   return res.status(405).json({ error: 'POST only' });

  const { photos } = req.body || {};
  if (!photos || typeof photos !== 'object') {
    return res.status(400).json({ error: 'No photos object provided' });
  }

  try {
    const blob = await put('md-photos-manifest.json', JSON.stringify(photos), {
      access: 'public',
      contentType: 'application/json',
      addRandomSuffix: false,
    });
    return res.status(200).json({ url: blob.url, count: Object.keys(photos).length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

handler.config = { api: { bodyParser: { sizeLimit: '64kb' } } };
module.exports = handler;
