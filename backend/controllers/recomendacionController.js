const pool = require('../config/db');

async function listarRecomendaciones(req, res, next) {
  // permite GET /recomendaciones?mazo_id=123 o GET /recomendaciones/123
  const mazo_id = req.query.mazo_id || req.params.mazoId;
  if (!mazo_id) {
    return res.status(400).json({ error: 'Falta el parámetro mazo_id' });
  }
  try {
    const result = await pool.query(
      `SELECT * 
         FROM recomendaciones 
        WHERE mazo_id = $1 
     ORDER BY fecha DESC`,
      [mazo_id]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function crearRecomendacion(req, res, next) {
  const { mazo_id, carta_id, tienda, precio, stock } = req.body;
  if (!mazo_id || !carta_id || !tienda || precio == null || stock == null) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO recomendaciones
         (mazo_id, carta_id, tienda, precio, stock, fecha)
       VALUES ($1,$2,$3,$4,$5,NOW())
     RETURNING *`,
      [mazo_id, carta_id, tienda, precio, stock]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editarRecomendacion(req, res, next) {
  const { id } = req.params;
  const fields = req.body;
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return res.status(400).json({ error: 'Sin campos para actualizar' });
  }
  const set = keys.map((k,i) => `${k} = $${i+1}`).join(', ');
  const vals = Object.values(fields);
  vals.push(id);
  try {
    const result = await pool.query(
      `UPDATE recomendaciones
          SET ${set}
        WHERE id = $${keys.length+1}
      RETURNING *`,
      vals
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Recomendación no encontrada' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function eliminarRecomendacion(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM recomendaciones
        WHERE id = $1
      RETURNING id`,
      [id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Recomendación no encontrada' });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarRecomendaciones,
  crearRecomendacion,
  editarRecomendacion,
  eliminarRecomendacion
};
