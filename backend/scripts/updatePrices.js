// backend/scripts/updatePrices.js
const pool      = require('../config/db');
const { fetchMylserena, fetchLaira } = require('../controllers/precioController');

async function run() {
  const [msMap, laMap] = await Promise.all([fetchMylserena(), fetchLaira()]);
  const now = new Date();
  for (const [name, price] of Object.entries({ ...msMap, ...laMap })) {
    await pool.query(
      `INSERT INTO price_cache(card_name, price_clp, last_updated)
       VALUES ($1, $2, $3)
       ON CONFLICT (card_name) DO UPDATE
         SET price_clp = EXCLUDED.price_clp,
             last_updated = EXCLUDED.last_updated;`,
      [name, price, now]
    );
  }
  console.log('Prices updated at', now);
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
