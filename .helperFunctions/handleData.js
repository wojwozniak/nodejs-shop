// Zbiór pomocniczych funkcji do obsługi bazy danych

// Importy
const { MongoClient, ServerApiVersion } = require('mongodb');
const credentials = require("../credentials.json");
const exampleProducts = require("./defaultProducts.json");
const Basket = require('../models/Basket');

const uri = `mongodb+srv://${credentials.databaseUser}:${credentials.databasePassword}@weppo.sew572t.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// Łączenie z bazą danych
async function connectToClient() {
  try {
    await client.connect();
    console.log("Connected to MongoDB.");
  } catch (err) {
    console.log(err.stack);
  }
}

// Zamykanie połączenia z bazą danych
async function closeClientConnection() {
  try {
    await client.close();
    console.log("Closed connection to MongoDB.");
  } catch (err) {
    console.log(err.stack);
  }
}

// Dodawanie domyślnych produktów do bazy danych
async function addProducts() {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('products');

    await collection.insertMany(exampleProducts);
    console.log("Added default products to the database");
  } finally {
    closeClientConnection();
  }
}

// Usuwanie wszystkich produktów z bazy danych
async function clearProducts() {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('products');

    await collection.deleteMany({});
    console.log("All products have been removed from the database");
  } finally {
    closeClientConnection();
  }
}

// Pobieranie wszystkich produktów z bazy danych
async function getAllProducts() {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('products');

    const products = await collection.find({}).toArray();
    console.log("Products retrieved:", products);
    return products;
  } finally {
    closeClientConnection();
  }
}

// Pobieranie wszystkich użytkowników z bazy danych
async function getAllUsers() {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('users');

    const products = await collection.find({}).toArray();
    console.log("Users retrieved:", products);
    return products;
  } finally {
    closeClientConnection();
  }
}

async function grantAdminRole(username) {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('users');

    const user = await collection.findOne({ username });

    if (!user) {
      throw new Error(`User '${username}' not found.`);
    }

    user.role = 'admin';

    await collection.updateOne({ username }, { $set: { role: 'admin' } });

    console.log(`User '${username}' has been granted the 'admin' role.`);
  } catch (error) {
    console.error('Error granting admin role:', error);
  } finally {
    closeClientConnection();
  }
}

async function deleteUser(username) {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('users');

    const user = await collection.findOne({ username });

    if (!user) {
      throw new Error(`User '${username}' not found.`);
    }

    await collection.deleteOne({ username });
    console.log(`User '${username}' account has been deleted.`);
  } catch (error) {
    console.error('Error deleting user account:', error);
  } finally {
    closeClientConnection();
  }
}

async function getUserData(username) {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('users');

    const user = await collection.findOne({ username });
    if (user) {
      console.log(`User '${username}' data:`, user);
      return user;
    }
    console.log(`User '${username}' not found.`);

  } catch (error) {
    console.error('Error getting user', error);
  } finally {
    closeClientConnection();
  }
}

async function getUserBasket(username) {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('users');

    const user = await collection.findOne({ username });
    if (!user) {
      console.log(`User '${username}' not found.`);
      return;
    }

    console.log("User found:", user);

    const collection2 = db.collection('baskets');
    const basket = await collection2.findOne({ _id: user.basket });
    if (basket) {
      console.log("User basket:", basket);
    } else {
      console.log("User basket not found.");
    }

  } catch (error) {
    console.error('Error getting user', error);
  } finally {
    closeClientConnection();
  }
}

async function clearUserBasketContents(username) {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('users');

    const user = await collection.findOne({ username });
    if (!user) {
      console.log(`User '${username}' not found.`);
      return;
    }

    console.log("User found:", user);

    const collection2 = db.collection('baskets');
    const basket = await collection2.findOne({ _id: user.basket });
    if (basket) {
      console.log("User basket:", basket);
      basket.items = [];
      await collection2.updateOne({ _id: user.basket }, { $set: { items: [] } });
    } else {
      console.log("User basket not found.");
    }

  } catch (error) {
    console.error('Error getting user', error);
  } finally {
    closeClientConnection();
  }
}

async function getSentOrders() {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('orders');

    const orders = await collection.find({}).toArray();
    console.log("Orders retrieved:", orders);
    console.log("Items in first order:", orders[0].items);
    return orders;
  } finally {
    closeClientConnection();
  }
}

async function deleteSentOrders() {
  try {
    connectToClient();

    const db = client.db("WEPPO");
    const collection = db.collection('orders');

    await collection.deleteMany({});
    console.log("All orders have been removed from the database");
  } finally {
    closeClientConnection();
  }
}

// Usuwanie wszyskich zamówień z bazy danych
//deleteSentOrders().catch(console.dir);

// Wysłane zamówienia
//getSentOrders().catch(console.dir);

// Wyczyść zawartość koszyka użytkownika
//clearUserBasketContents('admin').catch(console.dir);

// Pobierz koszyk użytkownika
//getUserBasket('admin').catch(console.dir);

// Pobierz dane pojedyńczego użytkownika
//getUserData('admin').catch(console.dir);

// Usuń użytkownika z bazy danych
//deleteUser('admin').catch(console.dir);

// Daj uprawnienia administratora użytkownikowi
//grantAdminRole('admin').catch(console.dir);

// Pobierz wszystkich użytkowników z bazy danych
//getAllUsers().catch(console.dir);

// Dodaj domyślne produkty do bazy danych
//addProducts().catch(console.dir);

// Wyczyść bazę danych z produktów
// clearProducts().catch(console.dir);

// Pobierz wszystkie produkty z bazy danych
// getAllProducts().catch(console.dir);
