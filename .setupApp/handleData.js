// Zbiór pomocniczych funkcji do obsługi bazy danych

// Importy
const { MongoClient, ServerApiVersion } = require('mongodb');
const credentials = require("../credentials.json");
const exampleProducts = require("./defaultProducts.json");

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

// Daj uprawnienia administratora użytkownikowi
grantAdminRole('admin').catch(console.dir);

// Pobierz wszystkich użytkowników z bazy danych
//getAllUsers().catch(console.dir);

// Dodaj domyślne produkty do bazy danych
//addProducts().catch(console.dir);

// Wyczyść bazę danych z produktów
// clearProducts().catch(console.dir);

// Pobierz wszystkie produkty z bazy danych
// getAllProducts().catch(console.dir);
