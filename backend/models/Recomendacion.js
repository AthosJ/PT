const pool = require('../config/db');

async function crearRecomendacion({ mazo_id, carta_id, tienda, precio, stock }) {
  const res = await pool.query(
    `INSERT INTO recomendaciones
     (mazo_id, carta_id, tienda, precio, stock, fecha)
     VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING *`,
    [mazo_id, carta_id, tienda, precio, stock]
  );
  return res.rows[0];
}

async function listarRecomendaciones(mazo_id) {
  const res = await pool.query(
    `SELECT r.*, c.nombre AS carta
     FROM recomendaciones r
     JOIN cartas c ON r.carta_id=c.id
     WHERE r.mazo_id=$1 ORDER BY fecha DESC`,
    [mazo_id]
  );
  return res.rows;
}

module.exports = { crearRecomendacion, listarRecomendaciones };