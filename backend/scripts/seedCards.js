// scripts/seedCards.js
const fs = require('fs');
const { Pool } = require('pg');
const slugify = require('slugify');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: Debes exportar DATABASE_URL antes de ejecutar este script.');
  process.exit(1);
}

// Decide SSL automáticamente:
// - Si DB_FORCE_SSL está definida, la respeta (true/false).
// - Si no, busca `sslmode=require` en la URL para activar SSL.
const forceSslEnv = process.env.DB_FORCE_SSL;
let useSsl;
if (typeof forceSslEnv !== 'undefined') {
  useSsl = String(forceSslEnv).toLowerCase() === 'true';
} else {
  useSsl = /sslmode=require/i.test(DATABASE_URL);
}

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

function mkSlug(name) {
  return slugify(name || '', { lower: true, strict: true });
}

async function columnExists(client, table, column) {
  const q = `
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = $1
      AND column_name = $2
    LIMIT 1;
  `;
  const r = await client.query(q, [table, column]);
  return r.rowCount > 0;
}

async function main() {
  let data;
  try {
    data = JSON.parse(fs.readFileSync('./cards.json', 'utf8'));
  } catch (e) {
    console.error('ERROR leyendo ./cards.json:', e.message);
    process.exit(1);
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const expectedCols = ['nombre','tipo','coste','rareza','slug','fuerza','raza','edicion','habilidad'];
    const available = {};
    for (const c of expectedCols) {
      available[c] = await columnExists(client, 'cartas', c);
    }

    // Asegúrate de tener índice único en slug (crea si no existe)
    if (available.slug) {
      await client.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS idx_cartas_slug
        ON cartas (slug);
      `);
    }

    for (const row of data) {
      const slug = mkSlug(row.nombre);
      const mapping = {
        nombre: row.nombre ?? null,
        tipo: row.tipo ?? null,
        coste: typeof row.coste !== 'undefined' ? row.coste : null,
        rareza: row.rareza ?? null,
        slug,
        fuerza: typeof row.fuerza !== 'undefined' ? row.fuerza : null,
        raza: row.raza ?? null,
        edicion: row.edicion ?? null,
        habilidad: row.habilidad ?? null
      };

      const fields = [];
      const vals = [];
      const placeholders = [];
      let idx = 1;
      for (const key of Object.keys(mapping)) {
        if (available[key]) {
          fields.push(key);
          vals.push(mapping[key]);
          placeholders.push(`$${idx++}`);
        }
      }

      if (fields.length === 0) {
        console.warn('No matching columns to insert for row', row.nombre);
        continue;
      }

      const setClause = fields
        .filter(f => f !== 'slug')
        .map(f => `${f} = EXCLUDED.${f}`)
        .join(', ');

      const insertSQL = `
        INSERT INTO cartas (${fields.join(',')})
        VALUES (${placeholders.join(',')})
        ON CONFLICT (slug) DO UPDATE SET
        ${setClause || 'slug = EXCLUDED.slug'}
        RETURNING id;
      `;

      const res = await client.query(insertSQL, vals);
      console.log('Upserted:', res.rows[0]?.id ?? 'ok', '-', row.nombre);
    }

    await client.query('COMMIT');
    console.log('Seed completed');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Seed failed:', err.message || err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch(e => {
  console.error('Fatal:', e);
  process.exit(1);
});
