require('dotenv').config(); // Подгружаем переменные окружения

const express = require('express');
const mongoose = require('mongoose');
const path = require('path'); // Подключаем модуль для работы с путями

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
const dbURI = process.env.MONGODB_URI;
console.log('Строка подключения из переменной окружения:', dbURI); // Проверка значения строки подключения

mongoose.connect(dbURI)
  .then(() => {
    console.log('Успешное подключение к базе данных');
  })
  .catch(err => {
    console.error('Ошибка подключения к базе данных:', err);
  });

// Middleware для парсинга JSON
app.use(express.json());

// Раздача статических файлов из папки public
app.use(express.static(path.join(__dirname, 'public')));

// Структура данных (модель кликов)
const clickSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    score: { type: Number, default: 0 }
});

const Click = mongoose.model('Click', clickSchema);

// API для обработки кликов
app.post('/api/click', async (req, res) => {
    const { userId } = req.body;

    try {
        let clickedUser = await Click.findOne({ userId });
        if (!clickedUser) {
            clickedUser = new Click({ userId, score: 0 });
        }
        
        clickedUser.score += 1; // Увеличиваем счет
        await clickedUser.save(); // Сохраняем изменения

        res.json({ userId: clickedUser.userId, score: clickedUser.score });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обработки клика' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
