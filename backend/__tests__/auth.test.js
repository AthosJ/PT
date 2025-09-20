// __tests__/auth.test.js
jest.setTimeout(20000);         
const request = require('supertest');
const app = require('../index');
const pool = require('../config/db');

describe('Auth Endpoints', () => {
  beforeAll(async () => {
    // limpiar usuarios previos para evitar conflictos
    await pool.query("DELETE FROM usuarios WHERE email = 't@test.com'");
  });

  it('debería registrar un usuario y devolver token', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nombre: 'Test', email: 't@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 't@test.com');
  });

  afterAll(async () => {
    // cierra la conexión al pool para que Jest termine
    await pool.end();
  });
});