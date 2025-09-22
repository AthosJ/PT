// __tests__/authMiddleware.test.js
jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../index');
const pool    = require('../config/db');

let playerToken;

describe('Auth Middleware', () => {
  beforeAll(async () => {
    await pool.query("DELETE FROM usuarios WHERE email = 'player@test.com'");
    const hash = await bcrypt.hash('123456', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'jugador')`,
      ['Player', 'player@test.com', hash]
    );

    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'player@test.com', password: '123456' });

    expect(loginRes.statusCode).toBe(200);
    playerToken = loginRes.body.token;
  });

  it('rechaza sin Authorization header', async () => {
    const res = await request(app).post('/cartas').send({});
    expect(res.statusCode).toBe(401);
  });

  it('rechaza con token mal formado', async () => {
    const res = await request(app)
      .post('/cartas')
      .set('Authorization', 'Bearer token-invalido')
      .send({});
    // Ajuste: ahora el middleware devuelve 403 para un token inválido
    expect(res.statusCode).toBe(403);
  });

  it('rechaza si no es admin', async () => {
    const res = await request(app)
      .post('/cartas')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({});
    expect(res.statusCode).toBe(403);
  });

  afterAll(async () => {
    await pool.query("DELETE FROM usuarios WHERE email = 'player@test.com'");
    await pool.end();
  });
});