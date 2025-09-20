// backend/controllers/mazoController.js
const pool = require('../config/db');

async function crearMazo(req, res, next) {
  const { nombre, descripcion } = req.body;
  const usuario_id = req.user?.id;        

  if (!nombre || !descripcion || !usuario_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mazos (nombre, descripcion, usuario_id)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, descripcion, fecha_creacion`,
      [nombre, descripcion, usuario_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function listarMazos(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, fecha_creacion
         FROM mazos`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function obtenerMazoPorId(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, fecha_creacion
         FROM mazos
        WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editarMazo(req, res, next) {
  const { id } = req.params;
  const campos = req.body;
  const keys = Object.keys(campos);

  if (keys.length === 0) {
    return res.status(400).json({ error: 'Sin campos para actualizar' });
  }

  const set = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  const values = Object.values(campos);

  try {
    const result = await pool.query(
      `UPDATE mazos
          SET ${set}
        WHERE id = $${keys.length + 1}
      RETURNING id, nombre, descripcion, fecha_creacion`,
      [...values, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function eliminarMazo(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM mazos
        WHERE id = $1
      RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearMazo,
  listarMazos,
  obtenerMazoPorId,
  editarMazo,
  eliminarMazo
};
