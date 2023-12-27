/* # Import */
const { MongoClient, ServerApiVersion } = require('mongodb');
const credentials = require('./credentials.json');
const express = require('express');
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

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

// Middleware used in login and registration routes
app.use(bodyParser.urlencoded({ extended: true }));

/* # Render root (product list) */
app.get('/', async (req, res) => {
    try {
        const products = await Product.find({});
        console.log("Products retrieved:", products);
        res.render('index', { products });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error occurred while fetching products');
    }
});

/* # Render auth (login and registration) */
app.get('/auth', (req, res) => {
    res.render('auth');
});





/* ### POST ROUTES ### */



/* # Login or register # */
app.post('/auth', async (req, res) => {
    if (req.body.action === 'register') {
        try {
            const newUser = new User(req.body);
            await newUser.save();
            res.redirect('/auth');
        } catch (error) {
            console.error(error);
            res.status(500).send('Error occurred while registering');
        }
    } else if (req.body.action === 'login') {
        try {
            const user = await User.findOne({ username: req.body.username });
            if (user && bcrypt.compareSync(req.body.password, user.password)) {
                res.redirect('/');
            } else {
                res.status(401).send('Invalid credentials');
            }
        } catch (error) {
            console.error(error);
            res.status(500).send('Error occurred while logging in');
        }
    }
});