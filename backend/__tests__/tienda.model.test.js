const pool = require('../config/db');
const { listarTiendas } = require('../models/Tienda');

describe('Modelo Tienda', () => {
  let tiendaId;

  beforeAll(async () => {
    //  Asegurar que la tabla exista
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tiendas (
        id SERIAL PRIMARY KEY,
        nombre TEXT NOT NULL UNIQUE
      );
    `);

    // 2) Limpiar cualquier registro anterior
    await pool.query("DELETE FROM tiendas WHERE nombre = 'TestTienda'");

    // 3) Insertar la tienda de prueba
    const res = await pool.query(
      `INSERT INTO tiendas (nombre)
         VALUES ($1)
       RETURNING id`,
      ['TestTienda']
    );
    tiendaId = res.rows[0].id;
  });

  afterAll(async () => {
    // Limpiar y cerrar
    await pool.query("DELETE FROM tiendas WHERE id = $1", [tiendaId]);
    await pool.end();
  });

  it('listarTiendas() devuelve la tienda recién insertada', async () => {
    const tiendas = await listarTiendas();
    expect(Array.isArray(tiendas)).toBe(true);
    expect(
      tiendas.some(t => t.id === tiendaId && t.nombre === 'TestTienda')
    ).toBe(true);
  });
});
