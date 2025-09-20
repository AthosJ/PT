// __tests__/mazoCarta.model.test.js
const pool = require('../config/db');
const {
  agregarCartaAMazo,
  quitarCartaDeMazo,
  obtenerCartasDeMazo
} = require('../models/MazoCarta');

// Para este set se necesita tener al menos un Mazo y una Carta en la BD de test.

describe('Modelo MazoCarta', () => {
  let mazoId, cartaId;

  beforeAll(async () => {
    // Inserta Mazo y Carta (usa pool.query)
    const m = await pool.query(
      `INSERT INTO mazos(nombre, descripcion) VALUES('M', 'D') RETURNING id`
    );
    mazoId = m.rows[0].id;

    const c = await pool.query(
      `INSERT INTO cartas(nombre, slug) VALUES('C','c') RETURNING id`
    );
    cartaId = c.rows[0].id;
  });

  it('agrega y lista cartas de un mazo', async () => {
    await agregarCartaAMazo(mazoId, cartaId, 2);
    const lista = await obtenerCartasDeMazo(mazoId);
    expect(lista).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ carta_id: cartaId, cantidad: 2 })
      ])
    );
  });

  it('quita carta de mazo', async () => {
    await quitarCartaDeMazo(mazoId, cartaId);
    const lista = await obtenerCartasDeMazo(mazoId);
    expect(lista.some(x => x.carta_id === cartaId)).toBe(false);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM mazos WHERE id = $1', [mazoId]);
    await pool.query('DELETE FROM cartas WHERE id = $1', [cartaId]);
    await pool.end();
  });
});