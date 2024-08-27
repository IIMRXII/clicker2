// routes/click.js
const express = require('express');
const Click = require('../models/Click');
const User = require('../models/User');
const router = express.Router();

// Проверка для администраторов
function isAdmin(req, res, next) {
    const userId = req.user._id; // Получаем ID текущего пользователя
    User.findById(userId, (err, user) => {
        if (err || !user || !user.isAdmin) {
            return res.status(403).send('Доступ запрещен');
        }
        next();
    });
}

// Клик для увеличения счета
router.post('/click', async (req, res) => {
    const { userId } = req.body;

    try {
        const click = await Click.findOne({ userId });
        if (click) {
            click.score += 1;
            await click.save(); // Обновляем счет
            res.status(200).json(click);
        } else {
            const newClick = new Click({ userId, score: 1 });
            await newClick.save(); // Создаем новый счет
            res.status(201).json(newClick);
        }
    } catch (err) {
        res.status(500).send('Ошибка при клике');
    }
});

// Получение счета пользователя
router.get('/:id', async (req, res) => {
    try {
        const click = await Click.findOne({ userId: req.params.id });
        if (!click) return res.status(404).send('Счет не найден');
        res.json(click);
    } catch (err) {
        res.status(500).send('Ошибка получения счета');
    }
});

// Обнуление счета (для администраторов)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        await Click.findOneAndDelete({ userId: req.params.id });
        res.send('Счет обнулен');
    } catch (err) {
        res.status(500).send('Ошибка обнуления счета');
    }
});

// Обновление счета пользователя (только для администраторов)
router.put('/:id', isAdmin, async (req, res) => {
    const { score } = req.body; // Получаем новый счет из тела запроса

    try {
        const click = await Click.findOne({ userId: req.params.id });
        if (!click) return res.status(404).send('Счет не найден');

        click.score = score; // Обновляем счет
        await click.save(); // Сохраняем изменения
        res.json(click); // Возвращаем обновленные данные
    } catch (err) {
        res.status(500).send('Ошибка обновления счета: ' + err.message);
    }
});

module.exports = router;
