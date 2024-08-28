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

// Middleware для парсинга JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Раздача статических файлов из папки public

// Структура данных (модель кликов)
const clickSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Идентификатор пользователя
    score: { type: Number, default: 0 } // Счет
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
        clickedUser.score += 1; // Увеличиваем счет
        await clickedUser.save(); // Сохраняем изменения

        // Отправляем ответ с ID и счетом
        res.json({ userId: clickedUser.userId, score: clickedUser.score });
    } catch (error) {
        res.status(500).json({ error: 'Ошибка обработки клика' });
