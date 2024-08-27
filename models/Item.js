// models/Item.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    }
});

// Создаем модель
const Item = mongoose.model('Item', itemSchema);

module.exports = Item;
