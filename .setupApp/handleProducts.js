const { MongoClient, ServerApiVersion } = require('mongodb');
const credentials = require("../credentials.json");
const exampleProducts = require("./defaultProducts.json")

async function connectToClient() {
    try {
        await client.connect();
        console.log("Connected successfully to server");
    } catch (err) {
        console.log(err.stack);
    }
}

async function closeClientConnection() {
    try {
        await client.close();
    } catch (err) {
        console.log(err.stack);
    }
}

async function addProducts() {
    try {
        connectToClient();

        const db = client.db("WEPPO");
        const collection = db.collection('products');

        await collection.insertMany(exampleProducts);
        console.log("Products added successfully");
    } finally {
        closeClientConnection();
    }
}

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

const uri = `mongodb+srv://${credentials.databaseUser}:${credentials.databasePassword}@weppo.sew572t.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Dodaj domyślne produkty do bazy danych
// addProducts().catch(console.dir);

// Wyczyść bazę danych z produktów
// clearProducts().catch(console.dir);

// Pobierz wszystkie produkty z bazy danych
// getAllProducts().catch(console.dir);