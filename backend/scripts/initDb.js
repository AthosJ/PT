// scripts/initDb.js
const pool = require('../config/db');

async function init() {
  // 1. Tabla cartas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.cartas (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255),
      tipo VARCHAR(100),
      coste INTEGER,
      rareza VARCHAR(50),
      slug VARCHAR(255),
      fuerza INTEGER,
      raza VARCHAR(100),
      edicion VARCHAR(100)
    );
  `);

  // 2. Tabla mazo_cartas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.mazo_cartas (
      id SERIAL PRIMARY KEY,
      mazo_id INTEGER,
      carta_id INTEGER,
      cantidad INTEGER
    );
  `);

  // 3. Tabla mazos
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.mazos (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255),
      usuario_id INTEGER,
      descripcion TEXT,
      fecha_creacion DATE DEFAULT CURRENT_DATE NOT NULL
    );
  `);

  // 4. Tabla recomendaciones
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.recomendaciones (
      id SERIAL PRIMARY KEY,
      mazo_id INTEGER NOT NULL,
      carta_id INTEGER NOT NULL,
      tienda VARCHAR(255) NOT NULL,
      precio INTEGER NOT NULL,
      stock INTEGER NOT NULL,
      fecha TIMESTAMP WITHOUT TIME ZONE DEFAULT now() NOT NULL
    );
  `);

  // 5. Tabla tiendas
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.tiendas (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL UNIQUE
    );
  `);

  // 6. Tabla usuarios
  await pool.query(`
    CREATE TABLE IF NOT EXISTS public.usuarios (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      hash_password VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'jugador'
    );
  `);

  // 7. Claves foráneas
  await pool.query(`
    ALTER TABLE IF EXISTS public.mazo_cartas
      ADD CONSTRAINT mazo_cartas_mazo_id_fkey FOREIGN KEY (mazo_id) REFERENCES public.mazos(id);
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS public.mazo_cartas
      ADD CONSTRAINT mazo_cartas_carta_id_fkey FOREIGN KEY (carta_id) REFERENCES public.cartas(id);
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS public.recomendaciones
      ADD CONSTRAINT recomendaciones_mazo_id_fkey FOREIGN KEY (mazo_id) REFERENCES public.mazos(id) ON DELETE CASCADE;
  `);

  await pool.query(`
    ALTER TABLE IF EXISTS public.recomendaciones
      ADD CONSTRAINT recomendaciones_carta_id_fkey FOREIGN KEY (carta_id) REFERENCES public.cartas(id) ON DELETE CASCADE;
  `);

  console.log('✅ Todas las tablas y relaciones fueron creadas o ya existían.');
  await pool.end();
}

init().catch(err => {
  console.error('❌ Error al inicializar la BD:', err);
  process.exit(1);
});
