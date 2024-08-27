// routes.js
const express = require('express');
const router = express.Router();
const Item = require('./models/Item'); // Импортируем модель

// Определите маршрут для корневого URL
router.get('/', (req, res) => {
    res.send('Добро пожаловать на главную страницу!');
});

// Пример маршрута к элементам
router.get('/items', async (req, res) => {
    try {
        const items = await Item.find(); // Получаем все элементы из базы данных
        res.json(items); // Возвращаем элементы в формате JSON
    } catch (err) {
        res.status(500).send('Ошибка при получении элементов');
    }
});

// Добавить новый элемент
router.post('/items', async (req, res) => {
    const newItem = new Item(req.body); // Создаем новый элемент
    try {
        await newItem.save(); // Сохраняем элемент в базе данных
        res.status(201).send('Элемент добавлен'); // Возвращаем статус после успешного добавления
    } catch (err) {
        res.status(400).send('Ошибка при добавлении элемента');
    }
});

module.exports = router;
