const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: Number
  }],
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: Date
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;