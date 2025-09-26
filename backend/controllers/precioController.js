// backend/controllers/precioController.js

const axios   = require('axios');
const cheerio = require('cheerio');
const pool    = require('../config/db');
const allCards = require('../cards.json');

/**
 * 1) Normalize: minúsculas, sin tildes, sin puntuación, espacios→guiones
 */
function normalize(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/**
 * 2) Búsqueda genérica en categoría (Mylserena o Laira)
 */
async function scrapeStoreSearch(storeRoot, slug) {
  const url = `${storeRoot}/?s=${encodeURIComponent(slug)}&post_type=product`;
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const prod = $('.products .product').first();
    if (!prod.length) {
      console.log(`🔍 [Search:${storeRoot}] No '${slug}'`);
      return 0;
    }
    const text = prod.find('.price ins .amount, .price .amount').first().text().trim();
    const num = parseInt(text.replace(/[^\d]/g, ''), 10) || 0;
    console.log(`✅ [Search:${storeRoot}] '${slug}' → ${num}`);
    return num;
  } catch (err) {
    console.error(`❌ [SearchError:${storeRoot}] ${slug}: ${err.message}`);
    return 0;
  }
}

/**
 * 3) Directo en Laira (/producto/{slug}/)
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
    console.warn(`🔍 [Direct:Laira] No '${slug}': ${err.message}`);
    return 0;
  }
}

/**
 * 4) Cache + scraping para un slug dado
 */
async function getPriceForSlug(rawSlug) {
  const slug = normalize(rawSlug);

  // 4.1 Cache
  const { rows } = await pool.query(
    `SELECT price_clp, last_updated FROM price_cache WHERE card_slug = $1`,
    [slug]
  );
  if (rows.length) {
    const { price_clp, last_updated } = rows[0];
    const ageHrs = (Date.now() - new Date(last_updated)) / 36e5;
    if (ageHrs < 24) {
      console.log(`⏱️ Cache válido '${slug}' → ${price_clp}`);
      return price_clp;
    }
  }

  // 4.2 Scraping
  let price = await scrapeStoreSearch('https://mylserena.cl', slug);

  if (!price) {
    price = await scrapeLairaDirect(slug);
    if (!price) {
      price = await scrapeStoreSearch('https://laira.cl', slug);
    }
  }

  // 4.3 Actualiza cache
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

/**
 * 5) Controller POST /api/precios
 */
async function getCardPrices(req, res, next) {
  try {
    const { cards } = req.body;
    console.log('→ /api/precios payload:', cards);

    if (!Array.isArray(cards)) {
      return res.status(400).json({ error: 'cards debe ser array de strings' });
    }

    // Build map: normalize(nombre) → slug
    const mapNameToSlug = allCards.reduce((acc, c) => {
      acc[ normalize(c.nombre) ] = c.slug;
      return acc;
    }, {});

    const result = await Promise.all(
      cards.map(async rawName => {
        console.log(`  • Procesando "${rawName}"`);
        const normName = normalize(rawName);
        let slug = mapNameToSlug[normName];

        if (!slug) {
          console.warn(`⚠️ Sin slug para "${rawName}", fallback a rawName`);
          slug = rawName;  // fallback: usamos rawName en el scraper
        }

        const price = await getPriceForSlug(slug);
        console.log(`    → Precio ${rawName}: ${price}`);
        return { name: rawName, price };
      })
    );

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCardPrices };
