// __tests__/scraper.test.js
jest.mock('axios');

const axios   = require('axios');
const cheerio = require('cheerio');
const { scrapeTiendas } = require('../utils/scraper');

describe('Scraper Tienda', () => {
  it('parses HTML y devuelve datos', async () => {
    const fakeHtml = `<div class="item">
                        <h2>Producto</h2>
                        <span class="price">1000</span>
                      </div>`;
    axios.get.mockResolvedValue({ data: fakeHtml });

    const datos = await scrapeTiendas('http://fake-url');
    expect(datos).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ nombre: 'Producto', precio: '1000' })
      ])
    );
  });
});