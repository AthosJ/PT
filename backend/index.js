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
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/cartas', cartaRoutes);
app.use('/mazos', mazoRoutes);
app.use('/recomendaciones', recomendacionRoutes);

if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => console.log(`Backend en puerto ${PORT}`));
}

module.exports = app;
