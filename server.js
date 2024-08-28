require('dotenv').config(); // Подгружаем переменные окружения
const express = require('express');
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Импортируем библиотеку uuid
const path = require('path'); // Подключаем модуль для работы с путями

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к MongoDB
const dbURI = process.env.MONGODB_URI;
mongoose.connect(dbURI)
    .then(() => {
        console.log('Успешное подключение к базе данных');
    })
    .catch(err ={console.error('Ошибка подключения к базе данных:', err);
    });

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Раздача статических файлов из папки public

// Структура данных (модель кликов)
const clickSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Идентификатор пользователя
    score: { type: Number, default: 0 }, // Счет
    clickMultiplier: { type: Number, default: 1 }, // Множитель кликов
    clickUpgradeCost: { type: Number, default: 100 } // Стоимость улучшения
});

const Click = mongoose.model('Click', clickSchema);

// API для обработки кликов
app.post('/api/click', async (req, res) => {
    let { userId } = req.body;

    // Если userId не передан, создаем новый
    if (!userId) {
        userId = uuidv4(); // Генерируем уникальный ID
    }

    try {
        let clickedUser = await Click.findOne({ userId });

        if (!clickedUser) {
            // Если не нашли пользователя, создаем нового
            clickedUser = new Click({ userId });
        }

        clickedUser.score += 1; // Увеличиваем счет
        await clickedUser.save(); // Сохраняем изменения

        // Отправляем ответ с ID и счетом
        res.json({ userId: clickedUser.userId, score: clickedUser.score });
    } catch (error) {
        console.error('Ошибка обработки клика:', error);
        res.status(500).json({ error: 'Ошибка обработки клика' });
    }
});

// API для обработки улучшений
app.post('/api/upgrade', async (req, res) => {
    let { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'Недопустимый userId' });
    }

    try {
        let clickedUser = await Click.findOne({ userId });

        if (!clickedUser) {
            // Создаем нового пользователя
            clickedUser = new Click({ userId });
        }

        if (clickedUser.score >= clickedUser.clickUpgradeCost) {
            clickedUser.score -= clickedUser.clickUpgradeCost; // Платим за улучшение
            clickedUser.clickMultiplier += 1; // Увеличиваем множитель
            clickedUser.clickUpgradeCost = Math.floor(clickedUser.clickUpgradeCost * 1.5); // Увеличиваем стоимость следующего улучшения
            await clickedUser.save(); // Сохраняем изменения

            // Отправляем ответ с ID, счетом и множеством улучшений
            res.json({
                userId: clickedUser.userId,
                score: clickedUser.score,
                clickMultiplier: clickedUser.clickMultiplier,
                clickUpgradeCost: clickedUser.clickUpgradeCost,
            });
        } else {
            return res.status(400).json({ error: 'Недостаточно очков для улучшения' });
        }
    } catch (error) {
        console.error('Ошибка обработки улучшения:', error);
        res.status(500).json({ error: 'Ошибка обработки улучшения' });
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на порту ${PORT}`);
});
