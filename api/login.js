export default function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const { password } = req.body;
    const correctPassword = process.env.APP_PASSWORD;

    if (!correctPassword) {
        return res.status(500).json({ success: false, message: 'Senha não configurada no servidor.' });
    }

    if (password === correctPassword) {
        return res.status(200).json({ success: true });
    } else {
        return res.status(401).json({ success: false, message: 'Senha incorreta!' });
    }
}