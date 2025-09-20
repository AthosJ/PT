// __tests__/login.test.js
jest.setTimeout(20000);

const request = require('supertest');
const bcrypt = require('bcrypt');
const app = require('../index');
const pool = require('../config/db');

describe('Login Endpoint', () => {
  beforeAll(async () => {
    // Limpia cualquier usuario previo
    await pool.query("DELETE FROM usuarios WHERE email = 'login@test.com'");

    // Hashea la contraseña y crea al usuario
    const hash = await bcrypt.hash('123456', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'jugador')`,
      ['Test', 'login@test.com', hash]
    );
  });

  it('debería autenticar con credenciales válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'login@test.com');
  });

  it('debería rechazar credenciales inválidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'login@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401); // ← corregido
    expect(res.body).toHaveProperty('error');
  });

  afterAll(async () => {
    await pool.end();
  });
});