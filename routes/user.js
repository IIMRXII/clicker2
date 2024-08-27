const express = require('express');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const router = express.Router();

// Регистрация пользователя
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        username,
        password: hashedPassword
    });

    try {
        await newUser.save();
        res.status(201).send('Пользователь зарегистрирован');
    } catch (err) {
        res.status(400).send('Ошибка при регистрации пользователя: ' + err.message);
    }
});

// Авторизация пользователя
router.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(404).send('Пользователь не найден');

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).send('Неверный пароль');

        res.status(200).json({
            _id: user._id,
            username: user.username,
            isAdmin: user.isAdmin // Добавляем поле isAdmin
        });
    } catch (err) {
        res.status(500).send('Ошибка при авторизации: ' + err.message);
    }
});

module.exports = router;