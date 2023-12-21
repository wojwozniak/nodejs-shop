const mongoose = require('mongoose');

const BasketSchema = new mongoose.Schema({
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        quantity: Number
    }],
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Basket = mongoose.model('Basket', BasketSchema);

module.exports = Basket;