const pool = require('../config/db');

async function crearUsuario(nombre, email, passwordHash, role = 'jugador') {
  const res = await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
     VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, role`,
    [nombre, email, passwordHash, role]
  );
  return res.rows[0];
}

async function obtenerUsuarioPorEmail(email) {
  const res = await pool.query(
    'SELECT * FROM usuarios WHERE email = $1',
    [email]
  );
  return res.rows[0];
}

module.exports = { crearUsuario, obtenerUsuarioPorEmail };