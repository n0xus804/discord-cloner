const express = require('express');
const router = express.Router();

// ===== МИДЛВАР: проверка админа =====
function isAdmin(req, res, next) {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.session.user.isAdmin) return res.status(403).json({ error: 'Admin only' });
    next();
}

// ===== СПИСОК ВСЕХ ПОЛЬЗОВАТЕЛЕЙ (только админ) =====
router.get('/users', isAdmin, (req, res) => {
    // В реальном проекте — запрос к базе данных
    res.json({
        users: [
            { id: '1', username: 'admin', premium: true, banned: false, tokens: 999 },
            { id: '2', username: 'user1', premium: false, banned: false, tokens: 5 }
        ]
    });
});

// ===== БАН ПОЛЬЗОВАТЕЛЯ =====
router.post('/ban/:userId', isAdmin, (req, res) => {
    const { userId } = req.params;
    // В реальном проекте — обновление в базе
    res.json({ success: true, message: `Пользователь ${userId} забанен` });
});

// ===== РАЗБАН =====
router.post('/unban/:userId', isAdmin, (req, res) => {
    const { userId } = req.params;
    res.json({ success: true, message: `Пользователь ${userId} разбанен` });
});

// ===== ВЫДАЧА ПРЕМИУМА =====
router.post('/premium/:userId', isAdmin, (req, res) => {
    const { userId } = req.params;
    res.json({ success: true, message: `Пользователь ${userId} получил премиум` });
});

// ===== СТАТИСТИКА =====
router.get('/stats', isAdmin, (req, res) => {
    res.json({
        totalUsers: 42,
        premiumUsers: 12,
        totalClones: 156,
        bannedUsers: 3
    });
});

module.exports = router;
