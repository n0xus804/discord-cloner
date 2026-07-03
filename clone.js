const express = require('express');
const axios = require('axios');
const router = express.Router();

// ===== МИДЛВАР: проверка авторизации =====
function isAuth(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.session.user.banned) return res.status(403).json({ error: 'You are banned' });
    if (req.session.user.tokens <= 0) return res.status(403).json({ error: 'No tokens left' });
    next();
}

// ===== ПРЕДПРОСМОТР (дерево сервера) =====
router.post('/preview', isAuth, async (req, res) => {
    const { token, serverId } = req.body;
    
    try {
        // Получаем структуру сервера
        const guild = await axios.get(`https://discord.com/api/v10/guilds/${serverId}`, {
            headers: { Authorization: token }
        });

        const channels = await axios.get(`https://discord.com/api/v10/guilds/${serverId}/channels`, {
            headers: { Authorization: token }
        });

        const roles = await axios.get(`https://discord.com/api/v10/guilds/${serverId}/roles`, {
            headers: { Authorization: token }
        });

        // Строим дерево
        const tree = {
            name: guild.data.name,
            icon: guild.data.icon,
            roles: roles.data.map(r => ({ name: r.name, color: r.color })),
            categories: [],
            channels: []
        };

        // Группируем каналы по категориям
        const categoryMap = {};
        for (const ch of channels.data) {
            if (ch.type === 4) {
                categoryMap[ch.id] = { name: ch.name, channels: [] };
            }
        }

        for (const ch of channels.data) {
            if (ch.type !== 4 && ch.parent_id && categoryMap[ch.parent_id]) {
                categoryMap[ch.parent_id].channels.push({ name: ch.name, type: ch.type });
            } else if (ch.type !== 4) {
                tree.channels.push({ name: ch.name, type: ch.type });
            }
        }

        tree.categories = Object.values(categoryMap);

        // Логируем клон в историю
        req.session.user.clones = req.session.user.clones || [];
        req.session.user.clones.push({
            serverId: serverId,
            serverName: guild.data.name,
            date: new Date()
        });
        req.session.user.tokens -= 1;

        res.json({ 
            success: true, 
            tree,
            tokensLeft: req.session.user.tokens,
            history: req.session.user.clones
        });

    } catch (error) {
        console.error('❌ Ошибка предпросмотра:', error.message);
        res.status(500).json({ error: 'Failed to fetch server structure' });
    }
});

module.exports = router;
