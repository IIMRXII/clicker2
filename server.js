require('dotenv').config(); // Подключаем dotenv
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// Определение схемы и модели для пользователя
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    score: { type: Number, default: 0 },
    clickMultiplier: { type: Number, default: 1 },
    clickUpgradeCost: { type: Number, default: 100 }
});

const User = mongoose.model('User', userSchema);

// Приложение и другие настройки (например, Express) идут сюда
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

app.use(bodyParser.json());

// Пример маршрута получения данных пользователя
app.post('/api/user', async (req, res) => {
    const { userId } = req.body;
    let user = await User.findOne({ userId });
    if (!user) {
        user = new User({ userId });
        await user.save();
    }
    res.json(user);
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
