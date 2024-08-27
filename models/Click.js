const mongoose = require('mongoose');

const clickSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User' // Ссылка на модель User
    },
    score: {
        type: Number,
        default: 0 // Базовый счет
    }
});

// Создаем модель
const Click = mongoose.model('Click', clickSchema);

module.exports = Click;