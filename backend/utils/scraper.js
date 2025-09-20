// backend/utils/scraper.js
const axios   = require('axios');
const cheerio = require('cheerio');

async function scrapeTiendas(url) {
  const { data } = await axios.get(url);
  const $ = cheerio.load(data);
  const resultados = [];

  $('.item').each((_, el) => {
    const nombre = $(el).find('h2').text().trim();
    const precio = $(el).find('.price').text().trim();
    resultados.push({ nombre, precio });
  });

  return resultados;
}

module.exports = { scrapeTiendas };