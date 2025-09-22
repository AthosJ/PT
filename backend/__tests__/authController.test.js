jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../index');
const pool    = require('../config/db');

beforeAll(async () => {
  await pool.query("DELETE FROM usuarios WHERE email IN ('test@test.com', 'duplicado@test.com', 'noexiste@test.com')");
});

afterAll(async () => {
  await pool.query("DELETE FROM usuarios WHERE email IN ('test@test.com', 'duplicado@test.com', 'noexiste@test.com')");
  await pool.end();
});

describe('AuthController – Registro y Login', () => {
  it('POST /auth/register → crea usuario correctamente', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nombre: 'Juan', email: 'test@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  it('POST /auth/register → falla si falta email', async () => {
    const res = await request(app)
      .post('/auth/register')
      .send({ nombre: 'Juan', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/register → falla si el email ya está registrado', async () => {
    await pool.query("DELETE FROM usuarios WHERE email = 'duplicado@test.com'");
    const hash = await bcrypt.hash('123456', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'user')`,
      ['Dup', 'duplicado@test.com', hash]
    );

    const res = await request(app)
      .post('/auth/register')
      .send({ nombre: 'Dup', email: 'duplicado@test.com', password: '123456' });

    expect(res.statusCode).toBe(409);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/login → falla si falta password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com' });

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/login → falla si el usuario no existe', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'noexiste@test.com', password: '123456' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/login → falla si la contraseña es incorrecta', async () => {
    await pool.query("DELETE FROM usuarios WHERE email = 'test@test.com'");
    const hash = await bcrypt.hash('123456', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'user')`,
      ['Test', 'test@test.com', hash]
    );

    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: 'wrongpass' });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /auth/login → éxito con credenciales válidas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'test@test.com', password: '123456' });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');
  });
});

