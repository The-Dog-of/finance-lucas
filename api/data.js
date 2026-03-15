import { put, list } from '@vercel/blob';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { blobs } = await list({ prefix: 'finances_data.json' });
            
            if (blobs.length === 0) {
                return res.status(200).json({ transactions: [], goals: [] });
            }
            
            const response = await fetch(blobs[0].url, { cache: 'no-store' });
            const data = await response.json();
            return res.status(200).json(data);
            
        } catch (e) {
            return res.status(500).json({ error: 'Erro ao ler a nuvem.' });
        }
    }

    if (req.method === 'POST') {
        try {
            await put('finances_data.json', JSON.stringify(req.body), { 
                access: 'public', 
                addRandomSuffix: false 
            });
            return res.status(200).json({ success: true });
        } catch (e) {
            return res.status(500).json({ error: 'Erro ao salvar na nuvem.' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}