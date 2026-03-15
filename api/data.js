export default async function handler(req, res) {
    const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

    if (!BLOB_TOKEN) {
        return res.status(500).json({ error: 'Token do Blob ausente' });
    }

    const FILENAME = 'finances_data.json';

    if (req.method === 'GET') {
        try {
            const listRes = await fetch(`https://blob.vercel-storage.com/?prefix=${FILENAME}`, {
                headers: {
                    authorization: `Bearer ${BLOB_TOKEN}`,
                    'x-api-version': '7'
                }
            });
            
            const list = await listRes.json();

            if (!list.blobs || list.blobs.length === 0) {
                return res.status(200).json({ transactions: [], goals: [] });
            }

            const fileUrl = list.blobs[0].url + '?t=' + Date.now();
            const dataRes = await fetch(fileUrl);
            const data = await dataRes.json();

            return res.status(200).json(data);
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    if (req.method === 'POST') {
        try {
            await fetch(`https://blob.vercel-storage.com/${FILENAME}`, {
                method: 'PUT',
                headers: { 
                    authorization: `Bearer ${BLOB_TOKEN}`, 
                    'x-api-version': '7',
                    'x-add-random-suffix': 'false',
                    'content-type': 'application/json' 
                },
                body: JSON.stringify(req.body)
            });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}