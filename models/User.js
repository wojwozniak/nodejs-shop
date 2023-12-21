const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: String,
    email: String,
    passwordHash: String,
    basket: { type: mongoose.Schema.Types.ObjectId, ref: 'Basket' }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;