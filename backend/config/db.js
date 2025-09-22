// backend/config/db.js
/*const path = require('path');
require('dotenv').config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  )
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    `❌ Falta DATABASE_URL en ${
      process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    }`
  );
}

const { parse } = require('pg-connection-string');
const { Pool }  = require('pg');

const config = parse(process.env.DATABASE_URL);

// imprime info de conexión para depurar
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
  database: config.database,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

module.exports = pool;*/

// backend/config/db.js
const path = require('path');
require('dotenv').config({
  path: path.resolve(
    __dirname,
    process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
  )
});

if (!process.env.DATABASE_URL) {
  throw new Error(
    `❌ Falta DATABASE_URL en ${
      process.env.NODE_ENV === 'test' ? '.env.test' : '.env'
    }`
  );
}

const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false
});

console.log(
  `Conectando a PostgreSQL (env=${process.env.NODE_ENV}) usando connectionString`
);

module.exports = pool;

