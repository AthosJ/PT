// backend/controllers/mazoCartaController.js
const pool = require('../config/db');

async function listarCartasEnMazo(req, res, next) {
  const mazoId = req.params.id;
  try {
    const result = await pool.query(
      `SELECT c.id, c.nombre, c.tipo, c.rareza, mc.cantidad, c.coste
         FROM mazos_cartas mc
         JOIN cartas c ON mc.carta_id = c.id
        WHERE mc.mazo_id = $1`,
      [mazoId]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function agregarCartaAlMazo(req, res, next) {
  const mazoId = req.params.id;
  const { carta_id, cantidad } = req.body;
  if (!carta_id || !cantidad) {
    return res.status(400).json({ error: 'Falta carta_id o cantidad' });
  }
  try {
    const result = await pool.query(
      `INSERT INTO mazos_cartas (mazo_id, carta_id, cantidad)
       VALUES ($1, $2, $3)
       ON CONFLICT (mazo_id, carta_id)
         DO UPDATE SET cantidad = mazos_cartas.cantidad + $3
       RETURNING mazo_id, carta_id, cantidad`,
      [mazoId, carta_id, cantidad]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function eliminarCartaDelMazo(req, res, next) {
  const mazoId = req.params.id;
  const cartaId = req.params.cartaId;
  try {
    await pool.query(
      `DELETE FROM mazos_cartas
        WHERE mazo_id = $1 AND carta_id = $2`,
      [mazoId, cartaId]
    );
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  listarCartasEnMazo,
  agregarCartaAlMazo,
  eliminarCartaDelMazo
};
