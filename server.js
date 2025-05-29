/**
 * @fileoverview Fichero principal del servidor para la aplicacion de Videojuegos-MongoDB
 * @requires express
 * @requires path
 * @requires ./config/database
 */

const express = require("express");
const path = require("path");
const { connectToMongo } = require("./config/database");

const app = express();

// Middleware
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Inicia el servidor y configura las rutas de la aplicación
 * @async
 * @function startServer
 * @throws {Error} Si hay un error al conectar con la base de datos
 */
async function startServer() {
  try {
    const db = await connectToMongo();
    app.locals.db = db;

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
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

startServer();
