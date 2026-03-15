export default async function handler(req, res) {
    const KV_URL = process.env.KV_REST_API_URL;
    const KV_TOKEN = process.env.KV_REST_API_TOKEN;

    if (!KV_URL || !KV_TOKEN) {
        return res.status(500).json({ error: 'Banco de dados KV não configurado.' });
    }

    if (req.method === 'GET') {
        try {
            const response = await fetch(`${KV_URL}/get/financesData`, {
                headers: { Authorization: `Bearer ${KV_TOKEN}` }
            });
            const data = await response.json();
            let parsed = { transactions: [], goals: [] };
            
            if (data.result) {
                parsed = typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
            }
            return res.status(200).json(parsed);
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao ler dados.' });
        }
    }

    if (req.method === 'POST') {
        try {
            await fetch(`${KV_URL}/set/financesData`, {
                method: 'POST',
                headers: { 
                    Authorization: `Bearer ${KV_TOKEN}`, 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify(req.body)
            });
            return res.status(200).json({ success: true });
        } catch (err) {
            return res.status(500).json({ error: 'Erro ao salvar dados.' });
        }
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
}