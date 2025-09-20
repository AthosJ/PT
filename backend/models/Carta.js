// backend/models/Carta.js
const pool = require('../config/db');

async function listarCartas() {
  const res = await pool.query(
    `SELECT id, nombre, tipo, fuerza, coste,
            raza, rareza, edicion, slug
       FROM cartas
      ORDER BY nombre`
  );
  return res.rows;
}

async function crearCarta({ 
  nombre, tipo, fuerza, coste,
  raza, rareza, edicion, slug
}) {
  const res = await pool.query(
    `INSERT INTO cartas
      (nombre, tipo, fuerza, coste,
       raza, rareza, edicion, slug)
     VALUES
      ($1,$2,$3,$4,$5,$6,$7,$8)
     RETURNING *`,
    [nombre, tipo, fuerza, coste, raza, rareza, edicion, slug]
  );
  return res.rows[0];
}

async function editarCarta(id, fields) {
  // Construye dinámicamente SET para los campos que llegan
  const keys   = Object.keys(fields);
  const values = Object.values(fields);
  if (keys.length === 0) return null;

  const sets = keys
    .map((key, i) => `${key} = $${i + 1}`)
    .join(', ');

  // El id va al final
  values.push(id);
  const query = `UPDATE cartas SET ${sets} WHERE id = $${keys.length + 1} RETURNING *`;
  const res   = await pool.query(query, values);
  return res.rows[0];
}

async function eliminarCarta(id) {
  await pool.query(`DELETE FROM cartas WHERE id = $1`, [id]);
}

module.exports = {
  listarCartas,
  crearCarta,
  editarCarta,
  eliminarCarta
};