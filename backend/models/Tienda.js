const pool = require('../config/db');

async function listarTiendas() {
  const res = await pool.query(`SELECT * FROM tiendas`);
  return res.rows;
}

module.exports = { listarTiendas };