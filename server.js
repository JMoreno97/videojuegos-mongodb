const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
require("dotenv").config();

// Verificar variables de entorno
console.log("Variables de entorno cargadas:");
console.log(
  "MONGODB_URI:",
  process.env.MONGODB_URI ? "Definida" : "No definida"
);
console.log("PORT:", process.env.PORT || "No definido (usando 3000)");

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Error: MONGODB_URI no está definida en el archivo .env");
  process.exit(1);
}

// Crear cliente de MongoDB
const client = new MongoClient(MONGODB_URI);

// Conectar a MongoDB
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB Atlas");

    // Hacer la base de datos disponible globalmente
    app.locals.db = client.db();
  } catch (err) {
    console.error("Error conectando a MongoDB Atlas:", err);
    process.exit(1);
  }
}

connectToMongo();

// API Routes
const videojuegosRoutes = require("./routes/videojuegos");
app.use("/api", videojuegosRoutes);

// Ruta para servir index.html en la raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Puerto
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
