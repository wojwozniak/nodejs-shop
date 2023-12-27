/* # Imports */
const express = require('express');
const app = express();
const path = require('path');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const session = require('express-session');

/* # Imports for database */
const credentials = require('./credentials.json');
const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');
const User = require('./models/User');
const Basket = require('./models/Basket');

/* # Setup session */
app.use(session({
  secret: 'lorem ipsum',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// Middleware used in login and registration routes
app.use(bodyParser.urlencoded({ extended: true }));

/* # Setup views */
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/* # Setup MongoDB using mongoose */
const uri = `mongodb+srv://${credentials.databaseUser}:${credentials.databasePassword}@weppo.sew572t.mongodb.net/WEPPO?retryWrites=true&w=majority`;
mongoose.connect(uri, {
  useNewUrlParser: true
}).then(() => {
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



/* ### GET ROUTES ### */

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
app.get('/dashboard', (req, res) => {
  if (req.session.user) {
    //console.log(req.session.user);
    res.render('dashboard', { user: req.session.user, currentPath: req.path });
  } else {
    res.redirect('/auth');
  }
});

app.get('/basket', async (req, res) => {
  if (req.session.user) {
    try {
      const basket = await Basket.findById(req.session.user.basket);
      console.log(basket);
      res.render('basket', { user: req.session.user, currentPath: req.path, basket: basket.items });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error in get /basket route - fetch basket');
    }

  } else {
    res.redirect('/auth');
  }
});

/* # Render auth (login and registration) */
app.get('/auth', (req, res) => {
  res.render('auth', { user: req.session.user, currentPath: req.path });
});

/* # Logout # */
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    res.redirect('/auth');
  });
});



/* ### POST ROUTES ### */

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