jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const app     = require('../index');
const pool    = require('../config/db');

let adminToken;
let playerToken;
let extMazoId;

beforeAll(async () => {
  await pool.query("DELETE FROM recomendaciones");
  await pool.query("DELETE FROM mazo_cartas");
  await pool.query("DELETE FROM mazos WHERE nombre IN ('ExtMazo','NuevoMazo')");
  await pool.query("DELETE FROM usuarios WHERE email IN ('admin2@test.com','player2@test.com')");

  const hashAdmin = await bcrypt.hash('adminpass', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
     VALUES ($1, $2, $3, 'admin')`,
    ['Admin2', 'admin2@test.com', hashAdmin]
  );

  const loginAdmin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin2@test.com', password: 'adminpass' });

  if (!loginAdmin.body.token) throw new Error('No se generó el token admin');
  adminToken = loginAdmin.body.token;

  const hashPlayer = await bcrypt.hash('playerpass', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
     VALUES ($1, $2, $3, 'jugador')`,
    ['Player2', 'player2@test.com', hashPlayer]
  );

  const loginPlayer = await request(app)
    .post('/auth/login')
    .send({ email: 'player2@test.com', password: 'playerpass' });

  playerToken = loginPlayer.body.token;

  const extMazo = await request(app)
    .post('/mazos')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nombre: 'ExtMazo', descripcion: 'Mazo de prueba' });

  extMazoId = extMazo.body.id;
});

afterAll(async () => {
  await pool.query("DELETE FROM recomendaciones");
  await pool.query("DELETE FROM mazo_cartas");
  await pool.query("DELETE FROM mazos WHERE nombre IN ('ExtMazo','NuevoMazo')");
  await pool.query("DELETE FROM usuarios WHERE email IN ('admin2@test.com','player2@test.com')");
  await pool.end();
});

describe('Mazos CRUD extendido', () => {
  it('Token contiene rol admin', () => {
    const decoded = jwt.decode(adminToken);
    expect(decoded).toHaveProperty('role', 'admin');
  });

  it('GET /mazos → lista todos', async () => {
    const res = await request(app).get('/mazos');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('GET /mazos/:id → devuelve uno', async () => {
    const res = await request(app).get(`/mazos/${extMazoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(extMazoId);
  });

  it('POST /mazos → 401 sin token', async () => {
    const res = await request(app)
      .post('/mazos')
      .send({ nombre: 'NuevoMazo', descripcion: 'Desc' });
    expect(res.statusCode).toBe(401);
  });

  it('POST /mazos → 403 si no es admin', async () => {
    const res = await request(app)
      .post('/mazos')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ nombre: 'NuevoMazo', descripcion: 'Desc' });
    expect(res.statusCode).toBe(403);
  });

  it('POST /mazos → 400 si faltan campos', async () => {
    const res = await request(app)
      .post('/mazos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
  });

  it('POST /mazos → crea nuevo', async () => {
    const res = await request(app)
      .post('/mazos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'NuevoMazo', descripcion: 'Desc' });
    expect(res.statusCode).toBe(201);
    expect(res.body.nombre).toBe('NuevoMazo');
  });

  it('PUT /mazos/:id → edita', async () => {
    const res = await request(app)
      .put(`/mazos/${extMazoId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'ExtMazoEditado' });
    expect(res.statusCode).toBe(200);
    expect(res.body.nombre).toBe('ExtMazoEditado');
  });

  it('DELETE /mazos/:id → borra', async () => {
    const res = await request(app)
      .delete(`/mazos/${extMazoId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(204);
  });
});
