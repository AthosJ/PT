const pool = require('../config/db');
const {
  listarCartas,
  crearCarta,
  editarCarta,
  eliminarCarta
} = require('../models/Carta');

describe('Modelo Carta', () => {
  let carta;

  beforeAll(async () => {
    // Asegurarnos de no chocar con otros slugs
    await pool.query("DELETE FROM cartas WHERE slug IN ('test-slug','edit-slug')");
  });

  afterAll(async () => {
    // Limpiar lo creado
    await pool.query("DELETE FROM cartas WHERE slug IN ('test-slug','edit-slug')");
    await pool.end();
  });

  it('crearCarta() inserta y devuelve la carta completa', async () => {
    carta = await crearCarta({
      nombre:  'CartaTest',
      tipo:    'Aliado',
      fuerza:   4,
      coste:    2,
      raza:    'Elfo',
      rareza:  'Verde',
      edicion: 'Demo',
      slug:    'test-slug'
    });

    expect(carta).toMatchObject({
      nombre:  'CartaTest',
      tipo:    'Aliado',
      fuerza:   4,
      coste:    2,
      raza:    'Elfo',
      rareza:  'Verde',
      edicion: 'Demo',
      slug:    'test-slug'
    });
    expect(typeof carta.id).toBe('number');
  });

  it('listarCartas() incluye la carta creada', async () => {
    const lista = await listarCartas();
    expect(Array.isArray(lista)).toBe(true);
    expect(lista.some(c => c.slug === 'test-slug')).toBe(true);
  });

  it('editarCarta() con body vacío retorna null', async () => {
    const result = await editarCarta(carta.id, {});
    expect(result).toBeNull();
  });

  it('editarCarta() actualiza campos existentes', async () => {
    const updated = await editarCarta(carta.id, {
      nombre: 'CartaEdit',
      slug:   'edit-slug'
    });

    expect(updated).toMatchObject({
      id:     carta.id,
      nombre: 'CartaEdit',
      slug:   'edit-slug'
    });
  });

  it('editarCarta() con id inexistente devuelve undefined', async () => {
    const res = await editarCarta(999999, { nombre: 'Nada' });
    expect(res).toBeUndefined();
  });

  it('eliminarCarta() borra la carta', async () => {
    await eliminarCarta(carta.id);
    const lista = await listarCartas();
    expect(lista.find(c => c.id === carta.id)).toBeUndefined();
  });
});
