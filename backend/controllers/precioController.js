// backend/controllers/precioController.js

const axios = require('axios');
const cheerio = require('cheerio');

// Scraper de Mylserena.cl
async function fetchMylserenaPrices() {
  const url = 'https://mylserena.cl/primera-era/singles-pe';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const priceMap = {};

  $('.products .product').each((_, el) => {
    const name = $(el)
      .find('.woocommerce-loop-product__title')
      .text()
      .trim()
      .toLowerCase();
    const priceText = $(el)
      .find('.price ins .amount, .price .amount')
      .first()
      .text()
      .trim();
    // Ej: “$15.000” → 15000
    const num = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
    priceMap[name] = num;
  });

  return priceMap;
}

// Scraper de Laira.cl
async function fetchLairaPrices() {
  const url = 'https://laira.cl/categoria-producto/singles/';
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const priceMap = {};

  $('.products .product').each((_, el) => {
    const name = $(el)
      .find('.woocommerce-loop-product__title')
      .text()
      .trim()
      .toLowerCase();
    const priceText = $(el)
      .find('.price ins .amount, .price .amount')
      .first()
      .text()
      .trim();
    const num = parseInt(priceText.replace(/[^\d]/g, ''), 10) || 0;
    priceMap[name] = num;
  });

  return priceMap;
}

// Endpoint POST /api/precios
async function getCardPrices(req, res, next) {
  const { cards } = req.body;
  if (!Array.isArray(cards)) {
    return res.status(400).json({ error: 'cards debe ser un array de nombres' });
  }

  try {
    const [msMap, laMap] = await Promise.all([
      fetchMylserenaPrices(),
      fetchLairaPrices()
    ]);

    const result = cards.map(rawName => {
      const key = rawName.trim().toLowerCase();
      const price = msMap[key] ?? laMap[key] ?? 0;
      return {
        name: rawName,
        price
      };
    });

    return res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCardPrices };
