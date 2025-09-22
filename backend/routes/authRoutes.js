/*const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const {
  crearUsuario,
  obtenerUsuarioPorEmail
} = require('../models/Usuario');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  const existe = await obtenerUsuarioPorEmail(email);
  if (existe) {
    return res.status(409).json({ error: 'Email ya registrado' });
  }

  const hash = bcrypt.hashSync(password, 10);
  const user = await crearUsuario(nombre, email, hash);
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET
  );

  res.status(200).json({ token, user });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son requeridos' });
  }

  const user = await obtenerUsuarioPorEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Usuario no encontrado' }); // ← corregido
  }

  const match = await bcrypt.compare(password, user.hash_password);
  if (!match) {
    return res.status(401).json({ error: 'Contraseña incorrecta' }); // ← corregido
  }

  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET
  );
  res.status(200).json({ token, user });
});

module.exports = router;*/ //cambio 17-09-2025 a las 16:28


const express = require('express');
const { register, login } = require('../controllers/authController');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;

