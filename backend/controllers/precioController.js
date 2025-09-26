// backend/controllers/precioController.js

const axios   = require('axios');
const cheerio = require('cheerio');
const pool    = require('../config/db');
const allCards = require('../cards.json');

// 1) Normalizar texto: minúsculas, sin tildes
function normalize(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

// 2) Scraping genérico: búsqueda por slug en categoría
async function scrapeStoreSearch(storeRoot, slug) {
  const url = `${storeRoot}/?s=${encodeURIComponent(slug)}&post_type=product`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const product = $('.products .product').first();
    if (!product.length) {
      console.log(`🔍 [Search:${storeRoot}] No encontré '${slug}'`);
      return 0;
    }
    const text = product.find('.price ins .amount, .price .amount').first().text().trim();
    const num  = parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
    console.log(`✅ [Search:${storeRoot}] '${slug}' → ${num}`);
    return num;
  } catch (err) {
    console.error(`❌ [SearchError:${storeRoot}] ${slug}:`, err.message);
    return 0;
  }
}

// 3) Scraping directo en Laira: /producto/{slug}/
async function scrapeLairaDirect(slug) {
  const url = `https://laira.cl/producto/${slug}/`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const text = $('.price ins .amount, .price .amount').first().text().trim();
    const num  = parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
    console.log(`✅ [Direct:Laira] '${slug}' → ${num}`);
    return num;
  } catch (err) {
    console.warn(`🔍 [Direct:Laira] No encontré o error en '${slug}':`, err.message);
    return 0;
  }
}

// 4) Obtener precio con cache + scraping
async function getPriceForSlug(rawSlug) {
  const slug = normalize(rawSlug);

  // 4.1) Intentar lectura en caché
  const { rows } = await pool.query(
    `SELECT price_clp, last_updated FROM price_cache WHERE card_slug = $1`,
    [slug]
  );

  if (rows.length) {
    const { price_clp, last_updated } = rows[0];
    const ageHrs = (Date.now() - new Date(last_updated)) / 36e5;
    if (ageHrs < 24) {
      return price_clp;
    }
  }

  // 4.2) Scraping en Mylserena
  let price = await scrapeStoreSearch('https://mylserena.cl', slug);

  // 4.3) Si no encontramos en Mylserena, probamos Laira directo + fallback search
  if (!price) {
    price = await scrapeLairaDirect(slug);
    if (!price) {
      price = await scrapeStoreSearch('https://laira.cl', slug);
    }
  }

  // 4.4) Actualizar caché
  await pool.query(
    `INSERT INTO price_cache(card_slug, price_clp, last_updated)
      VALUES ($1,$2,NOW())
      ON CONFLICT (card_slug) DO UPDATE
        SET price_clp    = EXCLUDED.price_clp,
            last_updated = EXCLUDED.last_updated;`,
    [slug, price]
  );

  return price;
}

// 5) Controller POST /api/precios
async function getCardPrices(req, res, next) {
  try {
    const { cards } = req.body;
    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards debe ser un array de nombres' });
    }

    // Mapeo nombre normalizado → slug desde cards.json
    const mapNameToSlug = allCards.reduce((acc, c) => {
      acc[ normalize(c.nombre) ] = c.slug;
      return acc;
    }, {});

    // Para cada carta, sacar precio
    const result = await Promise.all(
      cards.map(async rawName => {
        const normName = normalize(rawName);
        const slug     = mapNameToSlug[normName];
        if (!slug) {
          console.warn(`⚠️  No hay slug en cards.json para '${rawName}'`);
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
