/**
 * @fileoverview Rutas para la gestión de videojuegos y entidades relacionadas
 * @requires express
 * @requires mongodb
 */

const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");

/**
 * Obtiene todos los videojuegos con filtros opcionales
 * @route GET /api/videojuegos
 * @param {string} [query.genero] - Filtro por género
 * @param {string} [query.plataforma] - Filtro por plataforma
 * @param {string} [query.titulo] - Filtro por título (búsqueda parcial)
 * @returns {Object[]} Lista de videojuegos con sus relaciones pobladas
 * @throws {Error} Error del servidor
 */
router.get("/videojuegos", async (req, res) => {
  try {
    // 1. Obtenemos los parámetros de búsqueda de la URL
    const { genero, plataforma, titulo } = req.query;
    const db = req.app.locals.db;

    // 2. Preparamos el objeto de consulta
    let query = {};

    // 3. Aplicamos los filtros si existen
    if (genero) {
      // Buscamos primero el género por nombre
      const generoDoc = await db
        .collection("generos")
        .findOne({ nombre: genero });
      if (generoDoc) {
        // Si encontramos el género, añadimos su ID a la consulta
        query.genero_id = generoDoc._id;
      }
    }

    if (plataforma) {
      // Buscamos primero la plataforma por nombre
      const plataformaDoc = await db
        .collection("plataformas")
        .findOne({ nombre: plataforma });
      if (plataformaDoc) {
        // Si encontramos la plataforma, añadimos su ID a la consulta
        query.plataformas = plataformaDoc._id;
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

    // 4. Buscamos los videojuegos que coincidan con los filtros
    const videojuegos = await db
      .collection("videojuegos")
      .find(query)
      .toArray();

    // 5. Para cada videojuego, buscamos la información relacionada
    for (let videojuego of videojuegos) {
      // 5.1 Buscamos el género
      if (videojuego.genero_id) {
        const genero = await db.collection("generos").findOne(
          { _id: videojuego.genero_id },
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

      // 5.2 Buscamos el desarrollador
      if (videojuego.desarrollador_id) {
        const desarrollador = await db.collection("desarrolladores").findOne(
          { _id: videojuego.desarrollador_id },
          // Projection: solo obtenemos el campo 'nombre'
          // Esto hace la consulta más eficiente al traer solo los datos necesarios
          // Es como hacer SELECT nombre FROM desarrolladores en SQL
          { projection: { nombre: 1 } }
        );
        if (desarrollador) {
          videojuego.desarrollador = { nombre: desarrollador.nombre };
        }
      }

      // 5.3 Buscamos las plataformas
      if (videojuego.plataformas && videojuego.plataformas.length > 0) {
        const plataformas = await db
          .collection("plataformas")
          .find({ _id: { $in: videojuego.plataformas } })
          // Projection: solo obtenemos el campo 'nombre' de cada plataforma
          // Esto optimiza la consulta al traer solo los datos necesarios
          // Es como hacer SELECT nombre FROM plataformas en SQL
          .project({ nombre: 1 })
          .toArray();
        videojuego.plataformas = plataformas.map((p) => ({ nombre: p.nombre }));
      }
    }

    // 6. Enviamos la respuesta
    res.json(videojuegos);
  } catch (error) {
    res.status(500).json({
      error: "Error del servidor",
      details: error.message,
    });
  }
});

/**
 * Obtiene todos los géneros disponibles
 * @route GET /api/generos
 * @returns {Object[]} Lista de géneros
 * @throws {Error} Error del servidor
 */
router.get("/generos", async (req, res) => {
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

/**
 * Obtiene todas las plataformas disponibles
 * @route GET /api/plataformas
 * @returns {Object[]} Lista de plataformas
 * @throws {Error} Error del servidor
 */
router.get("/plataformas", async (req, res) => {
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

/**
 * Obtiene todos los desarrolladores disponibles
 * @route GET /api/desarrolladores
 * @returns {Object[]} Lista de desarrolladores
 * @throws {Error} Error del servidor
 */
router.get("/desarrolladores", async (req, res) => {
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

module.exports = router;
