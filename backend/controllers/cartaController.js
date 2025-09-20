const pool = require('../config/db');

async function listarCartas(req, res, next) {
  try {
    const result = await pool.query('SELECT * FROM cartas ORDER BY id ASC');
    res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function obtenerCartaPorId(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM cartas WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function crearCarta(req, res, next) {
  const {
    nombre, tipo, fuerza, coste,
    raza, rareza, edicion, slug
  } = req.body;

  if (!nombre || !tipo || !fuerza || !coste || !raza || !rareza || !edicion || !slug) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO cartas (nombre, tipo, fuerza, coste, raza, rareza, edicion, slug)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [nombre, tipo, fuerza, coste, raza, rareza, edicion, slug]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editarCarta(req, res, next) {
  const { id } = req.params;
  const campos = req.body;

  if (Object.keys(campos).length === 0) {
    return res.status(400).json({ error: 'No se enviaron campos para actualizar' });
  }

  const setClause = Object.keys(campos)
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');
  const values = Object.values(campos);

  try {
    const result = await pool.query(
      `UPDATE cartas SET ${setClause} WHERE id = $${values.length + 1} RETURNING *`,
      [...values, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }
    res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function eliminarCarta(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM cartas WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Carta no encontrada' });
    }
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarCartas,
  obtenerCartaPorId,
  crearCarta,
  editarCarta,
  eliminarCarta
};

