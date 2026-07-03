const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ===== МИДЛВАРЫ =====
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use(session({
    secret: process.env.SESSION_SECRET || 'secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 7 * 24 * 60 * 60 * 1000 } // 7 дней
}));

// ===== ИМПОРТ РОУТОВ =====
const authRoutes = require('./auth');
const adminRoutes = require('./admin');
const cloneRoutes = require('./clone');

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/clone', cloneRoutes);

// ===== ЗАПУСК =====
app.listen(PORT, () => {
    console.log(`✅ Сервер запущен на http://localhost:${PORT}`);
});
