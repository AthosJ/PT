// backend/controllers/precioController.js
const axios   = require('axios');
const cheerio = require('cheerio');
const pool    = require('../config/db');
const allCards = require('../cards.json');

// Normaliza texto: minúsculas, sin tildes
function normalize(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Scrapea precio vía búsqueda en la raíz de la tienda
async function scrapeStore(storeRoot, slug) {
  const url = `${storeRoot}/?s=${encodeURIComponent(slug)}&post_type=product`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const product = $('.products .product').first();
    if (!product.length) {
      console.log(`🔍 [${storeRoot}] No encontré '${slug}'`);
      return 0;
    }
    const priceText = product
      .find('.price ins .amount, .price .amount')
      .first()
      .text()
      .trim();
    const num = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
    console.log(`✅ [${storeRoot}] '${slug}' → ${num}`);
    return num;
  } catch (err) {
    console.error(`❌ Error scrapeando ${url}:`, err.message);
    return 0;
  }
}

async function getPriceForSlug(slug) {
  const normSlug = normalize(slug);

  // 1) Leer de cache
  const { rows } = await pool.query(
    `SELECT price_clp, last_updated FROM price_cache WHERE card_slug = $1`,
    [normSlug]
  );
  if (rows.length) {
    const { price_clp, last_updated } = rows[0];
    const ageHrs = (Date.now() - new Date(last_updated)) / 36e5;
    if (ageHrs < 24) return price_clp;
  }

  // 2) Scrapea en tiendas (raíz del sitio)
  let price = await scrapeStore('https://mylserena.cl', normSlug);
  if (!price) {
    price = await scrapeStore('https://laira.cl', normSlug);
  }

  // 3) Actualiza cache
  await pool.query(
    `INSERT INTO price_cache(card_slug, price_clp, last_updated)
     VALUES($1,$2,NOW())
     ON CONFLICT(card_slug) DO UPDATE
       SET price_clp    = EXCLUDED.price_clp,
           last_updated = EXCLUDED.last_updated;`,
    [normSlug, price]
  );

  return price;
}

async function getCardPrices(req, res, next) {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards debe ser array de strings' });
    }

    // Mapeo nombre normalizado → slug (desde cards.json)
    const mapNameToSlug = allCards.reduce((acc, c) => {
      acc[ normalize(c.nombre) ] = c.slug;
      return acc;
    }, {});

    const result = await Promise.all(
      cards.map(async rawName => {
        const normName = normalize(rawName);
        const slug = mapNameToSlug[normName];
        if (!slug) {
          console.warn(`⚠️ No hay slug para '${rawName}'`);
          return { name: rawName, price: 0 };
        }
        const price = await getPriceForSlug(slug);
        return { name: rawName, price };
      })
    );

    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCardPrices };
