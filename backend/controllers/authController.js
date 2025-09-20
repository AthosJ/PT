
const pool    = require('../config/db');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const { obtenerUsuarioPorEmail } = require('../models/Usuario');

async function register(req, res, next) {
  const { nombre, email, password } = req.body;
  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const existe = await obtenerUsuarioPorEmail(email);
    if (existe) {
      return res.status(409).json({ error: 'Email ya registrado' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, hash_password, role) VALUES ($1, $2, $3, $4) RETURNING id, nombre, email, role',
      [nombre, email, hashed, 'jugador']
    );

    const user  = result.rows[0];
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales' });
  }

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, role, hash_password FROM usuarios WHERE email = $1',
      [email]
    );
    if (!result.rows.length) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.hash_password);
    if (!match) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    const payload = { id: user.id, role: user.role };
    const token   = jwt.sign(payload, process.env.JWT_SECRET);

    // excluimos hash_password del objeto user que devolvemos
    delete user.hash_password;

    res.status(200).json({ token, user });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };


