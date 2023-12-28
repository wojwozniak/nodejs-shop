/* ##### GENERAL APP SETUP ##### */
//
//
//
//
//
//

/* # Imports */
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

/* # Imports for database */
const credentials = require('./credentials.json');
const mongoose = require('mongoose');
const User = require('./models/User');
const Basket = require('./models/Basket');
const Order = require('./models/Order');

/* # Setup session */
app.use(session({
  secret: 'lorem ipsum',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

/* # Setup body parser */
app.use(bodyParser.urlencoded({ extended: true }));

/* # Setup views */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* # Setup MongoDB using mongoose */
const uri = `mongodb+srv://${credentials.databaseUser}:${credentials.databasePassword}@weppo.sew572t.mongodb.net/WEPPO?retryWrites=true&w=majority`;
mongoose.connect(uri).then(() => {
  console.log("Successfully connected to MongoDB using Mongoose");
}).catch(err => {
  console.error("Error connecting to MongoDB", err);
});

/* # Setup models */
const Product = require('./models/Product');

/* # Setup app */
app.use(express.static(path.join(__dirname, 'public')));
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

/* # Helper functions */
const genUser = require('./functions/genUser');
const convertDateString = require('./functions/convertDateString');


const authorize = require('./middleware/authorize');

/* ### GET ROUTES ### */
//
//
//
//
//
//
//
//
//
//

/* # Render root (product list) */
app.get('/', async (req, res) => {
  try {
    const products = await Product.find({});
    //console.log("Products retrieved:", products);
    res.render('index', { products, user: req.session.user || null, currentPath: req.path });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get / route - fetch products');
  }

});

/* # Render search route (based on index.ejs) */
app.get('/search', async (req, res) => {
  try {
    const searchTerm = req.query.query;
    const products = await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    });
    console.log("Products retrieved:", products);
    res.render('index', { products, user: req.session.user || null, currentPath: req.path, searchTerm: searchTerm });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /search route - fetch products');
  }
});

/* # Render dashboard (user profile) or redirect to login/register */
app.get('/dashboard', authorize(1), (req, res) => res.render('dashboard', { user: req.session.user, currentPath: req.path }));

/* # Render basket */
app.get('/basket', authorize(1), async (req, res) => {
  try {
    const basket = await Basket.findById(req.session.user.basket);
    const products = await Product.find({});
    const checkoutData = [];
    for (let item of basket.items) {
      const product = products.find(product => product._id.toString() === item._id.toString());
      checkoutData.push({
        id: product._id.toString(),
        name: product.name,
        quantity: item.quantity,
        price: product.price
      });
    }

    res.render('basket', { user: req.session.user, currentPath: req.path, basket: checkoutData });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /basket route - fetch basket');
  }
});

/* # Render auth (login and registration) */
app.get('/auth', (req, res) => {
  res.render('auth', { user: req.session.user, currentPath: req.path });
});

/* # Render main admin panel */
app.get('/admin', authorize(2), async (req, res) => {
  try {
    res.render('admin', { user: req.session.user, currentPath: req.path });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /admin route');
  }
});

/* # Render admin panel for user list */
app.get('/admin/users', authorize(2), async (req, res) => {
  try {
    const users = await User.find({});
    res.render('admin-users', { user: req.session.user, currentPath: req.path, users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /admin/users route');
  }
});

/* # Render admin panel for order list */
app.get('/admin/orders', authorize(2), async (req, res) => {
  try {
    const orders = await Order.find({});
    const products = await Product.find({});
    let data = [];
    console.log(orders);
    for (let order of orders) {
      const items = [];
      for (let item of order.items) {
        const product = products.find(product => product._id.toString() === item._id.toString());
        items.push({
          name: product.name,
          quantity: item.quantity
        });
      }
      data.push({
        username: order.user,
        items,
        date: convertDateString(order.date)
      });
    }

    res.render('admin-orders', { user: req.session.user, currentPath: req.path, orders: data });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /admin/orders route');
  }
});

/* # Render admin panel for product list */
app.get('/admin/products', authorize(2), async (req, res) => {
  try {
    const products = await Product.find({});
    res.render('admin-products', { user: req.session.user, currentPath: req.path, products });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /admin/products route');
  }
});

/* # Render admin panel for editing product */
app.get('/admin/edit-product', authorize(2), async (req, res) => {
  try {
    const product = await Product.findById(req.query.id);
    res.render('admin-edit-product', { user: req.session.user, currentPath: req.path, product });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /admin/edit-product route');
  }
});

/* # Render admin panel for adding product */
app.get('/admin/add-product', authorize(2), async (req, res) => {
  try {
    res.render('admin-edit-product', { user: req.session.user, currentPath: req.path, product: null });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /admin/add-product route');
  }
});

/* ### POST ROUTES ### */
//
//
//
//
//
//
//
//
//
//
//
//

/* # Login or register # */
app.post('/auth', async (req, res) => {
  if (req.body.action === 'register') {
    try {
      // Check if email is already in use
      const existingUser = await User.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).send('Email already in use. Go back and try to log in instead!');
      }
      const existingUsername = await User.findOne({ username: req.body.username });
      if (existingUsername) {
        return res.status(400).send('Username already in use. Go back and try to log in instead!');
      }

      // Check if email is valid
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
        return res.status(400).send('Invalid email format');
      }

      genUser(req);
      res.redirect('/auth');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error in post /auth route - register user');
    }
  } else if (req.body.action === 'login') {
    try {
      const user = await User.findOne({ username: req.body.username });
      if (user && bcrypt.compareSync(req.body.password, user.password)) {
        req.session.user = {
          username: user.username,
          email: user.email,
          role: user.role,
          basket: user.basket
        };
        res.redirect('/');
      } else {
        res.status(401).send('Invalid credentials');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error in post /auth route - login user');
    }
  }
});

/* # Add product # */
app.post('/admin/add-product', authorize(2), async (req, res) => {
  try {
    const newProduct = new Product({
      ...req.body
    });
    await newProduct.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in post /admin/add-product route');
  }
});

/* # Edit product # */
app.post('/admin/edit-product', authorize(2), async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);
    product.name = req.body.name;
    product.description = req.body.description;
    product.image = req.body.image;
    product.category = req.body.category;
    product.quantity = req.body.quantity;
    product.price = req.body.price;
    product.brand = req.body.brand;
    await product.save();
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in post /admin/edit-product route');
  }
});

/* # Delete product # */
app.post('/admin/delete-product', authorize(2), async (req, res) => {
  try {
    const id = req.query.id;
    await Product.findByIdAndDelete(id);
    res.redirect('/admin/products');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in post /admin/delete-product route');
  }
});

/* # Logout # */
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/auth');
  });
});

/* # Clear basket */
app.get('/clearBasket', authorize(1), async (req, res) => {
  const basket = await Basket.findById(req.session.user.basket);
  basket.items = [];
  await basket.save();
  res.redirect('/basket');
});

/* # Checkout */
app.get('/sendOrder', authorize(1), async (req, res) => {
  const user = req.session.user.username;
  const newOrder = new Order({
    items: (await Basket.findById(req.session.user.basket)).items,
    user: user,
    date: new Date()
  });
  //console.log(newOrder);
  if (!newOrder.items.length) {
    return res.redirect('/basket');
  }
  await newOrder.save();
  res.redirect('/clearBasket');
});

/* # Render add to basket route */
app.get('/addToBasket', authorize(1), async (req, res) => {
  try {
    const id = req.query.id;
    const product = await Product.findById(id);
    const basket = await Basket.findById(req.session.user.basket);
    basket.items = basket.items || [];
    let productInBasket = false;
    for (let item of basket.items) {
      if (item._id.toString() === product.id) {
        item.quantity += 1;
        productInBasket = true;
        break;
      }
    }
    if (!productInBasket) {
      basket.items.push({
        _id: product._id,
        quantity: 1
      })
    }
    //console.log("Basket after push:", basket);
    await basket.save();
    res.redirect('/');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /addToBasket route - fetch product or save');
  }
});

/* # Render remove from basket route */
app.get('/removeFromBasket', authorize(1), async (req, res) => {
  try {
    const id = req.query.id;
    const basket = await Basket.findById(req.session.user.basket);
    basket.items = basket.items || [];
    for (let i = 0; i < basket.items.length; i++) {
      if (basket.items[i]._id.toString() === id) {
        basket.items.splice(i, 1);
        break;
      }
    }
    await basket.save();
    res.redirect('/basket');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error in get /removeFromBasket route - fetch product or save');
  }
});