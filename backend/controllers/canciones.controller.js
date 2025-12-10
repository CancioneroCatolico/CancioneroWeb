const Cancion = require('../models/cancion.model');
const Counter = require('../models/counter.model');

// GET /canciones
async function listar(_req, res) {
  const canciones = await Cancion.find().lean();
  res.json(canciones);
}

// GET /canciones/:id (Busca por numeroCancion)
async function obtenerPorId(req, res) {
  try {
    const numero = parseInt(req.params.id);
    if (isNaN(numero))
      return res.status(400).json({ error: "El parámetro debe ser un número (numeroCancion)" });

    const cancion = await Cancion.findOne({ numeroCancion: numero }).lean();

    if (!cancion)
      return res.status(404).json({ error: "Canción no encontrada " });
    res.json(cancion);
  } catch (err) {
    return res.status(500).json({ error: "Error en el servidor", detalle: err.message });
  }
}

// POST /canciones
async function crear(req, res) {
  try {
    let { numeroCancion } = req.body;

    if (!numeroCancion) {
      const ultimaCancion = await Counter.findByIdAndUpdate(
        { _id: 'canciones' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      ).lean();

      numeroCancion = ultimaCancion.seq;
    }

    const nueva = await Cancion.create({ ...req.body, numeroCancion });
    res.status(201).json(nueva);
  } catch (err) {
    res.status(400).json({ error: "Datos inválidos / número duplicado", detalle: err.message });
  }
}


// PUT /canciones/:id
async function actualizar(req, res) {
  try {
    const { numeroCancion, ...resto } = req.body;

    // Si el body trae numeroCancion, checkeamos que no esté usado por otra canción
    if (numeroCancion !== undefined) {
      const repetida = await Cancion.findOne({
        numeroCancion,
        _id: { $ne: req.params.id } // distinta canción
      }).lean();

      if (repetida) {
        return res.status(400).json({
          error: 'Ese número de canción ya está usado por otra canción'
        });
      }
    }

    // Armamos el objeto de actualización
    const datosActualizados = {
      ...resto,
      ...(numeroCancion !== undefined ? { numeroCancion } : {})
    };

    const actualizada = await Cancion.findByIdAndUpdate(
      req.params.id,
      datosActualizados,
      { new: true, runValidators: true }
    ).lean();

    if (!actualizada) {
      return res.status(404).json({ error: 'Canción no encontrada' });
    }

    res.json(actualizada);
  } catch (err) {
    res.status(400).json({
      error: 'Datos o ID inválidos',
      detalle: err.message
    });
  }
}

// DELETE /canciones/:id
async function eliminar(req, res) {
  try {
    const borrada = await Cancion.findByIdAndDelete(req.params.id).lean();
    if (!borrada)
      return res.status(404).json({ error: "Canción no encontrada " });
    res.json({ mensaje: "Canción eliminada " });
  } catch {
    res.status(400).json({ error: "ID inválido " });
  }
}

module.exports = { listar, obtenerPorId, crear, actualizar, eliminar };