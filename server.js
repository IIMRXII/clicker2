const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Модели
const userSchema = new mongoose.Schema({
    userId: { type: String, required: true, unique: true },
    score: { type: Number, default: 0 },
    clickMultiplier: { type: Number, default: 1 },
    clickUpgradeCost: { type: Number, default: 100 }
});

const User = mongoose.model('User', userSchema);

// Подключаемся к MongoDB
mongoose.connect(mongodb+srv://IIMRXII:1й2ц3у4к5е@clicker.pekwv.mongodb.net/?retryWrites=true&w=majority&appName=clicker, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Middleware
app.use(bodyParser.json());

// Получить пользователя
app.post('/api/user', async (req, res) => {
    const { userId } = req.body;
    
    let user = await User.findOne({ userId });
    if (!user) {
        user = new User({ userId });
        await user.save();
    }
    
    res.json(user);
});

// Получить пользователя по ID
app.get('/api/user/:userId', async (req, res) => {
    const user = await User.findOne({ userId: req.params.userId });
    if (user) return res.json(user);
    return res.status(404).json({ message: 'User not found' });
});

// Обновить счет
app.post('/api/click', async (req, res) => {
    const { userId } = req.body;
    const user = await User.findOneAndUpdate(
        { userId },
        { $inc: { score: 1 } },
        { new: true }
    );
    if (!user) {
        res.status(404).send('User not found');
    } else {
        res.json(user);
    }
});

// Обновление кликов
app.post('/api/upgrade', async (req, res) => {
    const { userId } = req.body;
    const user = await User.findOne({ userId });
    if (user) {
        if (user.score >= user.clickUpgradeCost) {
            user.score -= user.clickUpgradeCost;
            user.clickMultiplier += 1;
            user.clickUpgradeCost = Math.floor(user.clickUpgradeCost * 1.5);
            await user.save();
            res.json(user);
        } else {
            res.status(400).json({ message: 'Недостаточно очков для улучшения!' });
        }
    } else {
        res.status(404).send('User not found');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
