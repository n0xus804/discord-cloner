const mongoose = require('mongoose');

// ===== ПОДКЛЮЧЕНИЕ =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/discord-cloner', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// ===== МОДЕЛЬ ПОЛЬЗОВАТЕЛЯ =====
const UserSchema = new mongoose.Schema({
    discordId: { type: String, unique: true, required: true },
    username: { type: String, required: true },
    discriminator: { type: String, default: '0' },
    avatar: { type: String, default: null },
    email: { type: String, default: null },
    premium: { type: Boolean, default: false },
    banned: { type: Boolean, default: false },
    isAdmin: { type: Boolean, default: false },
    tokens: { type: Number, default: 5 },
    clones: [{
        sourceServerId: String,
        sourceServerName: String,
        targetServerId: String,
        targetServerName: String,
        status: { type: String, default: 'completed' },
        date: { type: Date, default: Date.now }
    }],
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

module.exports = { User };
