// backend/controllers/precioController.js

const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/db');
const slugify = require('slugify');
const allCards = require('../cards.json');

// Normaliza texto: minúsculas y sin tildes
function normalize(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// Scrapea el precio de una carta en una tienda dado el slug
async function scrapeStore(storeUrl, slug) {
  const url = `${storeUrl}/?s=${encodeURIComponent(slug)}&post_type=product`;
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const product = $('.products .product').first();
  if (!product.length) return 0;
  const priceText = product
    .find('.price ins .amount, .price .amount')
    .first()
    .text()
    .trim();
  return parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
}

// Busca precio en caché o scrapea en tiendas
async function getPriceForSlug(slug) {
  const normSlug = normalize(slug);

  // 1) Leer de cache
  const { rows } = await pool.query(
    `SELECT price_clp, last_updated
       FROM price_cache
      WHERE card_slug = $1;`,
    [normSlug]
  );
  if (rows.length) {
    const { price_clp, last_updated } = rows[0];
    // Si es reciente (<24h), devolvemos:
    if ((Date.now() - new Date(last_updated)) / 36e5 < 24) {
      return price_clp;
    }
  }

  // 2) Scrapea en Mylserena y Laira
  let price = await scrapeStore('https://mylserena.cl/primera-era/singles-pe', normSlug);
  if (!price) {
    price = await scrapeStore('https://laira.cl/categoria-producto/singles', normSlug);
  }

  // 3) Actualiza cache
  await pool.query(
    `INSERT INTO price_cache(card_slug, price_clp, last_updated)
     VALUES($1,$2,NOW())
     ON CONFLICT(card_slug) DO UPDATE
       SET price_clp = EXCLUDED.price_clp,
           last_updated = EXCLUDED.last_updated;`,
    [normSlug, price]
  );

  return price;
}

// Controller: POST /api/precios
async function getCardPrices(req, res, next) {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards debe ser un array de nombres' });
    }

    // Build map nombre → slug
    const mapNameToSlug = allCards.reduce((acc, c) => {
      acc[ normalize(c.nombre) ] = c.slug;
      return acc;
    }, {});

    // Para cada nombre en el body, buscamos el slug y luego el precio
    const result = await Promise.all(
      cards.map(async rawName => {
        const normName = normalize(rawName);
        const slug = mapNameToSlug[normName];
        if (!slug) {
          return { name: rawName, price: 0 };
        }
        const price = await getPriceForSlug(slug);
        return { name: rawName, price };
      })
    );

    return res.json(result);

  } catch (err) {
    next(err);
  }
}

module.exports = { getCardPrices };
