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
        // Convertimos el ID del género de string hexadecimal a ObjectId para la consulta
        // Esto es necesario porque MongoDB espera que los IDs en las consultas sean del tipo ObjectId
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
        // Convertimos el ID de la plataforma de string hexadecimal a ObjectId para la consulta
        // Esto es necesario porque MongoDB espera que los IDs en las consultas sean del tipo ObjectId
        query.plataformas = ObjectId.createFromHexString(
          plataformaDoc._id.toString()
        );
      }
    }

    if (titulo) {
      // Búsqueda por título: permite encontrar videojuegos que contengan el texto buscado
      // Ejemplo: si buscas "mario" encontrará "Super Mario Bros", "Mario Kart", etc.
      // La opción "i" hace que la búsqueda no distinga entre mayúsculas y minúsculas
      // Es como buscar en Google: no necesitas escribir el título exacto
      query.titulo = {
        $regex: titulo, // Busca el texto en cualquier parte del título
        $options: "i", // "i" = case insensitive (no distingue mayúsculas/minúsculas)
      };
    }

    const videojuegos = await db
      .collection("videojuegos")
      .find(query)
      .toArray();

    // Populate references
    for (let videojuego of videojuegos) {
      if (videojuego.genero_id) {
        // Convertimos el ID del género de string hexadecimal a ObjectId para la consulta
        // Esto es necesario porque MongoDB espera que los IDs en las consultas sean del tipo ObjectId
        const genero = await db.collection("generos").findOne(
          {
            _id: ObjectId.createFromHexString(videojuego.genero_id.toString()),
          },
          // Projection: especificamos qué campos queremos obtener de la base de datos
          // { nombre: 1 } significa "solo quiero el campo 'nombre'"
          // El 1 indica que queremos incluir ese campo
          // Es como hacer SELECT nombre FROM generos en SQL
          // Esto optimiza la consulta al traer solo los datos que necesitamos
          { projection: { nombre: 1 } }
        );
        if (genero) {
          videojuego.genero = { nombre: genero.nombre };
        }
      }

      if (videojuego.desarrollador_id) {
        // Convertimos el ID del desarrollador de string hexadecimal a ObjectId para la consulta
        // Esto es necesario porque MongoDB espera que los IDs en las consultas sean del tipo ObjectId
        const desarrollador = await db.collection("desarrolladores").findOne(
          {
            _id: ObjectId.createFromHexString(
              videojuego.desarrollador_id.toString()
            ),
          },
          // Projection: solo obtenemos el campo 'nombre'
          // Esto hace la consulta más eficiente al traer solo los datos necesarios
          // Es como hacer SELECT nombre FROM desarrolladores en SQL
          { projection: { nombre: 1 } }
        );
        if (desarrollador) {
          videojuego.desarrollador = { nombre: desarrollador.nombre };
        }
      }

      if (videojuego.plataformas && videojuego.plataformas.length > 0) {
        // Convertimos cada ID de plataforma de string hexadecimal a ObjectId para la consulta
        // Esto es necesario porque MongoDB espera que los IDs en las consultas sean del tipo ObjectId
        const plataformas = await db
          .collection("plataformas")
          .find({
            _id: {
              // $in: operador de MongoDB que busca documentos donde el campo _id
              // coincida con cualquiera de los valores en el array
              // Es como hacer WHERE id IN (...) en SQL
              $in: videojuego.plataformas.map((p) =>
                // Convertimos cada ID de string hexadecimal a ObjectId
                // Ejemplo: "507f1f77bcf86cd799439011" -> ObjectId("507f1f77bcf86cd799439011")
                ObjectId.createFromHexString(p.toString())
              ),
            },
          })
          // Projection: solo obtenemos el campo 'nombre' de cada plataforma
          // Esto optimiza la consulta al traer solo los datos necesarios
          // Es como hacer SELECT nombre FROM plataformas en SQL
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
