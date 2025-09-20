// __tests__/recomendacion.model.test.js
jest.setTimeout(20000);

const pool = require('../config/db');
const { crearRecomendacion, listarRecomendaciones } = require('../models/Recomendacion');
const { crearCarta } = require('../models/Carta');
const { crearMazo } = require('../models/Mazo');

describe('Modelo Recomendacion', () => {
  let mazo, carta, rec;

  beforeAll(async () => {
    // 1) Crear un mazo de prueba
    mazo = await crearMazo({ nombre: 'MazoRec', descripcion: 'Para test' });

    // 2) Crear una carta de prueba (todos los campos)
    carta = await crearCarta({
      nombre:  'CartaRec',
      tipo:    'Aliado',
      fuerza:   1,
      coste:    1,
      raza:    'Test',
      rareza:  'Real',
      edicion: 'X',
      slug:    'cartarec'
    });
  });

  it('crearRecomendacion inserta y devuelve la fila correcta', async () => {
    rec = await crearRecomendacion({
      mazo_id:  mazo.id,
      carta_id: carta.id,
      tienda:   'TiendaA',
      precio:    500,
      stock:     10
    });

    expect(rec).toHaveProperty('id');
    expect(rec.mazo_id).toBe(mazo.id);
    expect(rec.carta_id).toBe(carta.id);
    expect(rec.tienda).toBe('TiendaA');
    expect(rec.precio).toBe(500);
    expect(rec.stock).toBe(10);
    expect(rec.fecha).toBeTruthy();
  });

  it('listarRecomendaciones retorna la recomendación con el nombre de la carta', async () => {
    const lista = await listarRecomendaciones(mazo.id);

    expect(Array.isArray(lista)).toBe(true);
    expect(lista.length).toBeGreaterThan(0);

    const primera = lista[0];
    expect(primera).toMatchObject({
      mazo_id:  mazo.id,
      carta_id: carta.id,
      tienda:   'TiendaA',
      precio:    500,
      stock:     10,
      carta:    'CartaRec'
    });
    expect(primera.fecha).toBeTruthy();
  });

  afterAll(async () => {
    // Limpieza: borrar recomendaciones, mazo y carta
    await pool.query('DELETE FROM recomendaciones WHERE mazo_id = $1', [mazo.id]);
    await pool.query('DELETE FROM mazos WHERE id = $1',      [mazo.id]);
    await pool.query('DELETE FROM cartas WHERE id = $1',     [carta.id]);
    await pool.end();
  });
});