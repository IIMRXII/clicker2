require('dotenv').config(); // Подключаем dotenv
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
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

// Middleware для обработки JSON
app.use(bodyParser.json());

// Подключаем middleware для обслуживания статических файлов
app.use(express.static('public')); 

// Обработчик для инициализации пользователя
app.post('/api/user', async (req, res) => {
    const { userId } = req.body;
    
    let user = await User.findOne({ userId });
    if (!user) {
        user = new User({ userId });
        await user.save();
    }
    
    res.json(user);
});

// Обработчик для обновления кликов
app.post('/api/click', async (req, res) => {
    const { userId } = req.body;

    // Поиск пользователя и обновление счета
    const user = await User.findOneAndUpdate(
        { userId },
        { $inc: { score: 1 } },
        { new: true }
    );

    if (!user) {
        return res.status(404).send('Пользователь не найден');
    }
    
    res.json(user); // Возвращаем обновленного пользователя
});

// Обработчик для улучшения кликов
app.post('/api/upgrade', async (req, res) => {
    const { userId } = req.body;
    const user = await User.findOne({ userId });
    
    if (!user) {
        return res.status(404).send('Пользователь не найден');
    }

    // Проверяем, достаточно ли очков для улучшения
    if (user.score >= user.clickUpgradeCost) {
        user.score -= user.clickUpgradeCost; // Уменьшаем счет на стоимость улучшения
        user.clickMultiplier += 1; // Увеличиваем множитель кликов
        user.clickUpgradeCost = Math.floor(user.clickUpgradeCost * 1.5); // Обновляем стоимость улучшения
        await user.save(); // Сохраняем изменения
        res.json(user);
    } else {
        return res.status(400).json({ message: 'Недостаточно очков для улучшения!' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
