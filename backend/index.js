// backend/index.js
const path = require('path');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const cartaRoutes = require('./routes/cartaRoutes');
const mazoRoutes = require('./routes/mazoRoutes');
const recomendacionRoutes = require('./routes/recomendacionRoutes');

const app = express();

// Habilitar CORS y parseo de JSON
app.use(cors());
app.use(express.json());

// Rutas principales
app.use('/auth', authRoutes);
app.use('/cartas', cartaRoutes);
app.use('/mazos', mazoRoutes);
app.use('/decks', mazoRoutes); // alias en inglés
app.use('/recomendaciones', recomendacionRoutes);

// Prefijos /api para compatibilidad con el frontend
app.use('/api/auth', authRoutes);
app.use('/api/cartas', cartaRoutes);
app.use('/api/mazos', mazoRoutes);
app.use('/api/decks', mazoRoutes);
app.use('/api/recomendaciones', recomendacionRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// Arranque del servidor (omitido en tests)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));
}

module.exports = app;
