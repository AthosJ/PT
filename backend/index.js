// backend/index.js
const path = require('path');
const envFile = process.env.NODE_ENV === 'test' ? '.env.test' : '.env';
require('dotenv').config({ path: path.resolve(__dirname, envFile) });

const express = require('express');
const cors = require('cors');

const authRoutes          = require('./routes/authRoutes');
const cartaRoutes         = require('./routes/cartaRoutes');
const mazoRoutes          = require('./routes/mazoRoutes');
const recomendacionRoutes = require('./routes/recomendacionRoutes');
const precioRoutes        = require('./routes/precioRoutes');

const app = express();

// Habilitar CORS y parseo de JSON
app.use(cors());
app.use(express.json());

// Rutas “planas”
app.use('/auth', authRoutes);
app.use('/cartas', cartaRoutes);
app.use('/mazos', mazoRoutes);
app.use('/decks', mazoRoutes);
app.use('/recomendaciones', recomendacionRoutes);

// Rutas bajo /api para el frontend
app.use('/api/auth', authRoutes);
app.use('/api/cartas', cartaRoutes);
app.use('/api/mazos', mazoRoutes);
app.use('/api/decks', mazoRoutes);
app.use('/api/recomendaciones', recomendacionRoutes);
// Precios: POST /api/precios
app.use('/api', precioRoutes);

// Manejador global de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message });
});

// Arranque (omitido en test)
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));
}

module.exports = app;
