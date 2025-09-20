/*const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido o mal formado' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Token mal formado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}


function verificarAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: solo admin' }); // ← antes 400
  }
  next();
}

module.exports = { verificarToken, verificarAdmin }; */


// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');

function verificarToken(req, res, next) {
  const authHeader = req.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token requerido' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(403).json({ error: 'Token mal formado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
}

function verificarAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acceso denegado: solo admin' });
  }
  next();
}

module.exports = { verificarToken, verificarAdmin };
