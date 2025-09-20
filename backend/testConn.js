// testConn.js
const pool = require('./config/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('✅ Conexión OK, hora DB →', res.rows[0]);
  } catch (err) {
    console.error('❌ Error al conectar:', err);
  } finally {
    await pool.end();
  }
})();