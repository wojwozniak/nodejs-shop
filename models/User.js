const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  email: String,
  role: { type: String, default: 'user' },
  basket: { type: mongoose.Schema.Types.ObjectId, ref: 'Basket' }
});

UserSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = bcrypt.hashSync(this.password, 12);
  }
  next();
});

const User = mongoose.model('User', UserSchema);

module.exports = User;