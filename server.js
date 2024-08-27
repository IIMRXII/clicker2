require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.log('Error connecting to MongoDB:', err));

// Обработчик корневого маршрута
app.get('/', (req, res) => {
    res.send('Привет! Это корень вашего приложения.');
});

// Middleware
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
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
