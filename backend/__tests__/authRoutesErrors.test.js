// __tests__/authRoutesErrors.test.js
jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../index');
const pool    = require('../config/db');

describe('Auth Routes: casos de error', () => {
  beforeAll(async () => {
    // Asegura que no exista el usuario de prueba
    await pool.query("DELETE FROM usuarios WHERE email = 'dup@test.com'");
  });

  it('POST /auth/register sin campo email → 400', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ password: '123456', nombre: 'Dup' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/register duplicado → 409', async () => {
    // 1. registro inicial
    await request(app)
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: '123456', nombre: 'Dup' })
      .expect(200);

    // 2. registro duplicado
    const dup = await request(app)
      .post('/auth/register')
      .send({ email: 'dup@test.com', password: '123456', nombre: 'Dup' });
    expect(dup.statusCode).toBe(409);
    expect(dup.body).toHaveProperty('error');
  });

  it('POST /auth/login sin password → 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'dup@test.com' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  afterAll(async () => {
    await pool.query("DELETE FROM usuarios WHERE email = 'dup@test.com'");
    await pool.end();
  });
});