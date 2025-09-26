// backend/controllers/precioController.js

const axios = require('axios');
const cheerio = require('cheerio');
const pool = require('../config/db');
const allCards = require('../cards.json');

/**
 * Normaliza texto a slug:
 * - Minúsculas
 * - Sin tildes
 * - Sin puntuación
 * - Espacios a guiones
 */
function normalize(text) {
  return text
    .toString()
    .normalize('NFD')                         // descompone acentos
    .replace(/[\u0300-\u036f]/g, '')          // quita acentos
    .replace(/['’.,\/#!$%\^&\*;:{}=\-_`~()]/g,'') // quita puntuación
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');                   // espacios a guiones
}

/**
 * Scrapea vía búsqueda en la raíz de la tienda.
 * storeRoot: 'https://mylserena.cl' o 'https://laira.cl'
 */
async function scrapeStoreSearch(storeRoot, slug) {
  const url = `${storeRoot}/?s=${encodeURIComponent(slug)}&post_type=product`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const product = $('.products .product').first();
    if (!product.length) {
      console.log(`🔍 [Search:${storeRoot}] No encontrado '${slug}'`);
      return 0;
    }
    const text = product.find('.price ins .amount, .price .amount').first().text().trim();
    const num = parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
    console.log(`✅ [Search:${storeRoot}] '${slug}' → ${num}`);
    return num;
  } catch (err) {
    console.error(`❌ [SearchError:${storeRoot}] ${slug}: ${err.message}`);
    return 0;
  }
}

/**
 * Scrapea directamente la URL de producto en Laira: /producto/{slug}/
 */
async function scrapeLairaDirect(slug) {
  const url = `https://laira.cl/producto/${slug}/`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const text = $('.price ins .amount, .price .amount').first().text().trim();
    const num = parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
    console.log(`✅ [Direct:Laira] '${slug}' → ${num}`);
    return num;
  } catch (err) {
    console.warn(`🔍 [Direct:Laira] No encontrado '${slug}': ${err.message}`);
    return 0;
  }
}

/**
 * Obtiene precio de un slug:
 * 1) Cache
 * 2) Mylserena search
 * 3) Laira direct
 * 4) Laira search
 * 5) Guarda en cache
 */
async function getPriceForSlug(rawSlug) {
  const slug = normalize(rawSlug);

  // 1) Intentar cache
  const { rows } = await pool.query(
    `SELECT price_clp, last_updated FROM price_cache WHERE card_slug = $1`,
    [slug]
  );
  if (rows.length) {
    const { price_clp, last_updated } = rows[0];
    const ageHrs = (Date.now() - new Date(last_updated)) / 36e5;
    if (ageHrs < 24) return price_clp;
  }

  // 2) Scrapea Mylserena
  let price = await scrapeStoreSearch('https://mylserena.cl', slug);

  // 3) Si no, Laira direct + search
  if (!price) {
    price = await scrapeLairaDirect(slug);
    if (!price) {
      price = await scrapeStoreSearch('https://laira.cl', slug);
    }
  }

  // 4) Actualizar cache
  await pool.query(
    `INSERT INTO price_cache(card_slug, price_clp, last_updated)
       VALUES($1,$2,NOW())
       ON CONFLICT(card_slug) DO UPDATE
         SET price_clp    = EXCLUDED.price_clp,
             last_updated = EXCLUDED.last_updated;`,
    [slug, price]
  );

  return price;
}

/**
 * POST /api/precios
 * Recibe { cards: ['Nombre Carta', ...] }
 * Responde [{ name, price }]
 */
async function getCardPrices(req, res, next) {
  try {
    const { cards } = req.body;
    console.log('→ /api/precios payload:', cards);

    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards debe ser array' });
    }

    // Map nombre normalizado → slug
    const mapNameToSlug = allCards.reduce((acc, c) => {
      acc[normalize(c.nombre)] = c.slug;
      return acc;
    }, {});

    // Para cada carta buscamos precio
    const result = await Promise.all(
      cards.map(async name => {
        console.log(`  • Procesando "${name}"`);
        const norm = normalize(name);
        const slug = mapNameToSlug[norm];
        if (!slug) {
          console.warn(`⚠️ No slug para "${name}"`);
          return { name, price: 0 };
        }
        const price = await getPriceForSlug(slug);
        console.log(`    → Precio ${name}: ${price}`);
        return { name, price };
      })
    );

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCardPrices };
