/**
 * @fileoverview Versión simplificada del servidor que combina todos los componentes MVC en un único archivo
 * @requires express
 * @requires mongodb
 * @requires path
 * @requires dotenv
 */

const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const path = require("path");
require("dotenv").config();

// Configuración de la base de datos local
const MONGODB_URI = "mongodb://localhost:27017/videojuegos";
const client = new MongoClient(MONGODB_URI);

// Configuración de Express
const app = express();
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Establece la conexión con la base de datos MongoDB local
 * @async
 * @function connectToMongo
 * @returns {Promise<Db>} Instancia de la base de datos MongoDB
 * @throws {Error} Si hay un error al conectar con MongoDB
 */
async function connectToMongo() {
  try {
    await client.connect();
    console.log("Conectado a MongoDB local");
    return client.db();
  } catch (err) {
    console.error("Error conectando a MongoDB local:", err);
    process.exit(1);
  }
}

// Rutas de la API
// GET /api/videojuegos - Obtiene todos los videojuegos con filtros opcionales
app.get("/api/videojuegos", async (req, res) => {
  try {
    const { genero, plataforma, titulo } = req.query;
    const db = req.app.locals.db;
    let query = {};

    if (genero) {
      const generoDoc = await db
        .collection("generos")
        .findOne({ nombre: genero });
      if (generoDoc) {
        query.genero_id = ObjectId.createFromHexString(
          generoDoc._id.toString()
        );
      }
    }

    if (plataforma) {
      const plataformaDoc = await db
        .collection("plataformas")
        .findOne({ nombre: plataforma });
      if (plataformaDoc) {
        query.plataformas = ObjectId.createFromHexString(
          plataformaDoc._id.toString()
        );
      }
    }

    if (titulo) {
      query.titulo = { $regex: titulo, $options: "i" };
    }

    const videojuegos = await db
      .collection("videojuegos")
      .find(query)
      .toArray();

    // Populate references
    for (let videojuego of videojuegos) {
      if (videojuego.genero_id) {
        const genero = await db.collection("generos").findOne(
          {
            _id: ObjectId.createFromHexString(videojuego.genero_id.toString()),
          },
          { projection: { nombre: 1 } }
        );
        if (genero) {
          videojuego.genero = { nombre: genero.nombre };
        }
      }

      if (videojuego.desarrollador_id) {
        const desarrollador = await db.collection("desarrolladores").findOne(
          {
            _id: ObjectId.createFromHexString(
              videojuego.desarrollador_id.toString()
            ),
          },
          { projection: { nombre: 1 } }
        );
        if (desarrollador) {
          videojuego.desarrollador = { nombre: desarrollador.nombre };
        }
      }

      if (videojuego.plataformas && videojuego.plataformas.length > 0) {
        const plataformas = await db
          .collection("plataformas")
          .find({
            _id: {
              $in: videojuego.plataformas.map((p) =>
                ObjectId.createFromHexString(p.toString())
              ),
            },
          })
          .project({ nombre: 1 })
          .toArray();
        videojuego.plataformas = plataformas.map((p) => ({ nombre: p.nombre }));
      }
    }

    res.json(videojuegos);
  } catch (error) {
    res.status(500).json({
      error: "Error del servidor",
      details: error.message,
    });
  }
});

// GET /api/generos - Obtiene todos los géneros
app.get("/api/generos", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const generos = await db.collection("generos").find().toArray();
    res.json(generos);
  } catch (error) {
    res.status(500).json({
      error: "Error del servidor",
      details: error.message,
    });
  }
});

// GET /api/plataformas - Obtiene todas las plataformas
app.get("/api/plataformas", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const plataformas = await db.collection("plataformas").find().toArray();
    res.json(plataformas);
  } catch (error) {
    res.status(500).json({
      error: "Error del servidor",
      details: error.message,
    });
  }
});

// GET /api/desarrolladores - Obtiene todos los desarrolladores
app.get("/api/desarrolladores", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const desarrolladores = await db
      .collection("desarrolladores")
      .find()
      .toArray();
    res.json(desarrolladores);
  } catch (error) {
    res.status(500).json({
      error: "Error del servidor",
      details: error.message,
    });
  }
});

// Ruta para servir index.html en la raíz
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

/**
 * Inicia el servidor y configura la conexión a la base de datos
 * @async
 * @function startServer
 * @throws {Error} Si hay un error al conectar con la base de datos
 */
async function startServer() {
  try {
    const db = await connectToMongo();
    app.locals.db = db;

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
