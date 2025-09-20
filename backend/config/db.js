// backend/config/db.js
require('dotenv').config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    `❌ Falta DATABASE_URL en ${
      process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    }`
  );
}

const { parse }    = require('pg-connection-string');
const { Pool }     = require('pg');

const config = parse(process.env.DATABASE_URL);

// opcional: imprime para depurar
console.log(`Conectando a PostgreSQL (env=${process.env.NODE_ENV}):`, {
  host:     config.host,
  port:     config.port,
  database: config.database,
  user:     config.user
});

const pool = new Pool({
  host:     config.host,
  port:     parseInt(config.port, 10),
  user:     config.user,
  password: config.password,
  database: config.database
});

module.exports = pool;