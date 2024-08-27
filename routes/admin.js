const express = require('express');
const User = require('../models/User');
const Click = require('../models/Click');
const router = express.Router();

// Получение всех пользователей и их счетов
router.get('/users', async (req, res) => {
    try {
        const users = await User.find();

        const usersWithScores = await Promise.all(users.map(async user => {
            const clickData = await Click.findOne({ userId: user._id });
            return {
                _id: user._id,
                username: user.username,
                score: clickData ? clickData.score : 0,
                isAdmin: user.isAdmin
            };
        }));

        res.json(usersWithScores);
    } catch (err) {
        res.status(500).send('Ошибка получения пользователей: ' + err.message);
    }
});

// Обновление счета пользователя (только для администраторов)
router.put('/users/:id', async(req, res) => {
    const { score } = req.body;

    try {
        const clickData = await Click.findOne({ userId: req.params.id });
        if (!clickData) {
            return res.status(404).send('Счет не найден');
        }

        clickData.score = score; // Обновляем счет
        await clickData.save(); // Сохраняем изменения
        res.json(clickData); // Возвращаем обновленные данные
    } catch (err) {
        res.status(500).send('Ошибка обновления счета: ' + err.message);
    }
});

module.exports = router;