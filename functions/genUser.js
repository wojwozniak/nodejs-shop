const User = require('../models/User');
const Basket = require('../models/Basket');

async function genUser(req) {
  // Generate basket
  const newBasket = new Basket({
    items: []
  });
  await newBasket.save();

  const newUser = new User({
    ...req.body,
    basket: newBasket._id
  });

  await newUser.save();
}

module.exports = genUser;