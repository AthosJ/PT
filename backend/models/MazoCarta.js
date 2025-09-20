// backend/models/MazoCarta.js
const pool = require('../config/db');

async function agregarCartaAMazo(mazo_id, carta_id, cantidad) {
  await pool.query(
    `INSERT INTO mazo_cartas (mazo_id, carta_id, cantidad)
       VALUES ($1,$2,$3)`,
    [mazo_id, carta_id, cantidad]
  );
}

async function obtenerCartasDeMazo(mazo_id) {
  const res = await pool.query(
    `SELECT mazo_id, carta_id, cantidad
       FROM mazo_cartas
      WHERE mazo_id = $1`,
    [mazo_id]
  );
  return res.rows;
}

async function quitarCartaDeMazo(mazo_id, carta_id) {
  await pool.query(
    `DELETE FROM mazo_cartas
      WHERE mazo_id = $1
        AND carta_id = $2`,
    [mazo_id, carta_id]
  );
}

module.exports = {
  agregarCartaAMazo,
  obtenerCartasDeMazo,
  quitarCartaDeMazo
};