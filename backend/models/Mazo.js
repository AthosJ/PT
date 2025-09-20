// backend/models/Mazo.js
const pool = require('../config/db');

async function crearMazo({ nombre, descripcion }) {
  const res = await pool.query(
    `INSERT INTO mazos (nombre, descripcion, fecha_creacion)
       VALUES ($1,$2,CURRENT_DATE)
     RETURNING *`,
    [nombre, descripcion]
  );
  return res.rows[0];
}

async function listarMazos() {
  const res = await pool.query(
    `SELECT id, nombre, descripcion, fecha_creacion
       FROM mazos
      ORDER BY fecha_creacion DESC`
  );
  return res.rows;
}

async function editarMazo(id, fields) {
  const keys = Object.keys(fields);
  const vals = Object.values(fields);
  if (keys.length === 0) return null;

  const setStr = keys
    .map((k,i) => `${k} = $${i+1}`)
    .join(', ');

  vals.push(id);
  const query = `
    UPDATE mazos
       SET ${setStr}
     WHERE id = $${keys.length+1}
  RETURNING *`;
  const res = await pool.query(query, vals);
  return res.rows[0];
}

async function eliminarMazo(id) {
  await pool.query(`DELETE FROM mazos WHERE id = $1`, [id]);
}

module.exports = {
  crearMazo,
  listarMazos,
  editarMazo,
  eliminarMazo
};