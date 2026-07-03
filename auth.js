const express = require('express');
const axios = require('axios');
const router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

// ===== ВХОД ЧЕРЕЗ DISCORD =====
router.get('/discord', (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=identify%20email%20guilds`;
    res.redirect(url);
});

// ===== КОЛЛБЭК ПОСЛЕ ВХОДА =====
router.get('/callback', async (req, res) => {
    const { code } = req.query;
    
    try {
        // Обмен код на токен
        const tokenRes = await axios.post('https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                grant_type: 'authorization_code',
                code,
                redirect_uri: REDIRECT_URI
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const { access_token } = tokenRes.data;

        // Получение данных пользователя
        const userRes = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${access_token}` }
        });

        const userData = userRes.data;

        // Сохраняем в сессию
        req.session.user = {
            id: userData.id,
            username: userData.username,
            discriminator: userData.discriminator,
            avatar: userData.avatar,
            email: userData.email,
            premium: false,
            banned: false,
            isAdmin: false,
            tokens: 5
        };

        res.redirect('/dashboard');

    } catch (error) {
        console.error('❌ Ошибка авторизации:', error.message);
        res.redirect('/?error=auth_failed');
    }
});

// ===== ВЫХОД =====
router.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// ===== ПРОВЕРКА АВТОРИЗАЦИИ =====
router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authorized' });
    }
    res.json(req.session.user);
});

module.exports = router;
