const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

// Obtener todos los videojuegos con filtros
router.get("/videojuegos", async (req, res) => {
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

// Obtener todos los géneros
router.get("/generos", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const generos = await db.collection("generos").find().toArray();
    res.json(generos);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error del servidor", details: error.message });
  }
});

// Obtener todas las plataformas
router.get("/plataformas", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const plataformas = await db.collection("plataformas").find().toArray();
    res.json(plataformas);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Error del servidor", details: error.message });
  }
});

// Obtener todos los desarrolladores
router.get("/desarrolladores", async (req, res) => {
  try {
    console.log("Recibida petición GET /api/desarrolladores");
    const db = req.app.locals.db;
    const desarrolladores = await db
      .collection("desarrolladores")
      .find()
      .toArray();
    console.log("Desarrolladores encontrados:", desarrolladores);
    res.json(desarrolladores);
  } catch (error) {
    console.error("Error en GET /api/desarrolladores:", error);
    res
      .status(500)
      .json({ error: "Error del servidor", details: error.message });
  }
});

module.exports = router;
