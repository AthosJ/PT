//backend/controllers/precioController.js
const axios   = require('axios');
const cheerio = require('cheerio');
const pool    = require('../config/db');

// Normaliza slugs (quita tildes y pone minúscula)
function normalize(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Scrapea precio individual vía búsqueda
async function fetchPriceFromStore(storeUrl, slug) {
  const url = `${storeUrl}/?s=${encodeURIComponent(slug)}&post_type=product`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const first = $('.products .product').first();
  const priceText = first.find('.price ins .amount, .price .amount')
    .first()
    .text()
    .trim();
  return parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
}

// Devuelve precio de una carta buscando en caché o scrapeando
async function getPriceForSlug(slug) {
  const norm = normalize(slug);

  // 1) Revisar caché
  const cache = await pool.query(
    `SELECT price_clp, last_updated
       FROM price_cache
      WHERE card_slug = $1;`,
    [norm]
  );
  if (cache.rowCount > 0) {
    const { price_clp, last_updated } = cache.rows[0];
    // Si es reciente (<24h), devolver
    const ageHrs = (Date.now() - new Date(last_updated)) / 36e5;
    if (ageHrs < 24) return price_clp;
  }

  // 2) Scrape en tiendas
  let price = 0;
  // Intenta Mylserena
  try {
    price = await fetchPriceFromStore('https://mylserena.cl/primera-era/singles-pe', norm);
  } catch { /* ignora */ }
  // Si no lo encontró, intenta Laira
  if (price === 0) {
    try {
      price = await fetchPriceFromStore('https://laira.cl/categoria-producto/singles', norm);
    } catch { /* ignora */ }
  }

  // 3) Actualizar caché
  await pool.query(
    `INSERT INTO price_cache(card_slug, price_clp, last_updated)
     VALUES ($1,$2,NOW())
     ON CONFLICT (card_slug)
     DO UPDATE SET price_clp = EXCLUDED.price_clp,
                   last_updated = EXCLUDED.last_updated;`,
    [norm, price]
  );

  return price;
}

// Controller para POST /api/precios
async function getCardPrices(req, res, next) {
  try {
    const { cards } = req.body; // array de nombres EXACTOS de cards.json
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards debe ser un array de nombres' });
    }
    // Para cada nombre buscamos su slug en cards.json
    const allCards = require('../cards.json');
    const nameToSlug = Object.fromEntries(
      allCards.map(c => [c.nombre, c.slug])
    );

    const result = {};
    for (const nombre of cards) {
      const slug = nameToSlug[nombre];
      if (!slug) {
        result[nombre] = 0;
        continue;
      }
      result[nombre] = await getPriceForSlug(slug);
    }

    // Responde [{ name, price }]
    res.json(Object.entries(result).map(([name, price]) => ({ name, price })));
  } catch (err) {
    next(err);
  }
}

module.exports = { getCardPrices };
