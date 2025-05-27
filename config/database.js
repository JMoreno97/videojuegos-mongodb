const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI no está definida en el archivo .env");
  process.exit(1);
}

const client = new MongoClient(MONGODB_URI);

async function connectToMongo() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");
    return client.db();
  } catch (err) {
    console.error("Error conectando a MongoDB Atlas:", err);
    process.exit(1);
  }
}

module.exports = {
  connectToMongo,
  client,
};
