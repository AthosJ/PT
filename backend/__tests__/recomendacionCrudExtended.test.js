jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../index');
const pool    = require('../config/db');

let adminToken;
let playerToken;
let recCardId;
let recMazoId;
let recId;

beforeAll(async () => {
  // Limpieza inicial
  await pool.query("DELETE FROM recomendaciones");
  await pool.query("DELETE FROM cartas WHERE slug = 'rec-card'");
  await pool.query("DELETE FROM mazos WHERE nombre = 'RecMazo'");

  // Borramos usuarios para partir limpio
  await pool.query("DELETE FROM usuarios WHERE email = 'admin4@test.com'");
  await pool.query("DELETE FROM usuarios WHERE email = 'player4@test.com'");

  // Crear admin (ON CONFLICT para no romper)
  const hashAdmin = await bcrypt.hash('adminpass4', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
       DO UPDATE SET hash_password = EXCLUDED.hash_password, role = 'admin'`,
    ['Admin4', 'admin4@test.com', hashAdmin]
  );
  const loginAdmin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin4@test.com', password: 'adminpass4' });
  if (!loginAdmin.body.token) throw new Error('Login admin falló');
  adminToken = loginAdmin.body.token;

  // Crear jugador (ON CONFLICT igual)
  const hashPlayer = await bcrypt.hash('playerpass4', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'jugador')
     ON CONFLICT (email)
       DO UPDATE SET hash_password = EXCLUDED.hash_password, role = 'jugador'`,
    ['Player4', 'player4@test.com', hashPlayer]
  );
  const loginPlayer = await request(app)
    .post('/auth/login')
    .send({ email: 'player4@test.com', password: 'playerpass4' });
  if (!loginPlayer.body.token) throw new Error('Login jugador falló');
  playerToken = loginPlayer.body.token;

  // Crear carta de prueba
  const createCard = await request(app)
    .post('/cartas')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      nombre: 'RecCard',
      tipo: 'Aliado',
      fuerza: 2,
      coste: 1,
      raza: 'Humano',
      rareza: 'Azul',
      edicion: 'Test',
      slug: 'rec-card'
    });
  recCardId = createCard.body.id;
  if (!recCardId) throw new Error('No se creó la carta para recomendaciones');

  // Crear mazo de prueba
  const createMazo = await request(app)
    .post('/mazos')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ nombre: 'RecMazo', descripcion: 'Mazo para recs' });
  recMazoId = createMazo.body.id;
  if (!recMazoId) throw new Error('No se creó el mazo para recomendaciones');
});

afterAll(async () => {
  await pool.query("DELETE FROM recomendaciones");
  await pool.query("DELETE FROM cartas WHERE slug = 'rec-card'");
  await pool.query("DELETE FROM mazos WHERE nombre = 'RecMazo'");
  await pool.query("DELETE FROM usuarios WHERE email = 'admin4@test.com'");
  await pool.query("DELETE FROM usuarios WHERE email = 'player4@test.com'");
  await pool.end();
});

describe('Recomendaciones CRUD extendido', () => {
  it('GET /recomendaciones → 400 si falta mazo_id', async () => {
    const res = await request(app).get('/recomendaciones');
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Falta el parámetro mazo_id');
  });

  it('GET /recomendaciones?mazo_id= → 200 y lista vacía inicialmente', async () => {
    const res = await request(app).get(`/recomendaciones?mazo_id=${recMazoId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  it('POST /recomendaciones → 401 si no hay token', async () => {
    const res = await request(app)
      .post('/recomendaciones')
      .send({ mazo_id: recMazoId, carta_id: recCardId, tienda: 'StoreA', precio: 50, stock: 10 });
    expect(res.statusCode).toBe(401);
  });

  it('POST /recomendaciones → 403 si no es admin', async () => {
    const res = await request(app)
      .post('/recomendaciones')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ mazo_id: recMazoId, carta_id: recCardId, tienda: 'StoreA', precio: 50, stock: 10 });
    expect(res.statusCode).toBe(403);
  });

  it('POST /recomendaciones → 400 si faltan campos', async () => {
    const res = await request(app)
      .post('/recomendaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mazo_id: recMazoId, carta_id: recCardId, tienda: 'StoreA' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /recomendaciones → 201 crea una recomendación', async () => {
    const res = await request(app)
      .post('/recomendaciones')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ mazo_id: recMazoId, carta_id: recCardId, tienda: 'StoreA', precio: 50, stock: 10 });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    recId = res.body.id;
  });

  it('GET /recomendaciones?mazo_id= → lista la recomendación creada', async () => {
    const res = await request(app).get(`/recomendaciones?mazo_id=${recMazoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.some(r => r.id === recId)).toBe(true);
  });

  it('GET /recomendaciones/:mazoId → encuentra la recomendación por param', async () => {
    const res = await request(app).get(`/recomendaciones/${recMazoId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.find(r => r.id === recId)).toBeDefined();
  });

  it('PUT /recomendaciones/:id → 401 si no hay token', async () => {
    const res = await request(app).put(`/recomendaciones/${recId}`).send({ precio: 60 });
    expect(res.statusCode).toBe(401);
  });

  it('PUT /recomendaciones/:id → 403 si no es admin', async () => {
    const res = await request(app)
      .put(`/recomendaciones/${recId}`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ precio: 60 });
    expect(res.statusCode).toBe(403);
  });

  it('PUT /recomendaciones/:id → 400 si no body', async () => {
    const res = await request(app)
      .put(`/recomendaciones/${recId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('PUT /recomendaciones/:id → 200 actualiza precio y stock', async () => {
    const res = await request(app)
      .put(`/recomendaciones/${recId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ precio: 60, stock: 5 });
    expect(res.statusCode).toBe(200);
    expect(res.body.precio).toBe(60);
    expect(res.body.stock).toBe(5);
  });

  it('PUT /recomendaciones/:id → 404 si no existe', async () => {
    const res = await request(app)
      .put('/recomendaciones/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ precio: 1 });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /recomendaciones/:id → 401 si no hay token', async () => {
    const res = await request(app).delete(`/recomendaciones/${recId}`);
    expect(res.statusCode).toBe(401);
  });

  it('DELETE /recomendaciones/:id → 403 si no es admin', async () => {
    const res = await request(app)
      .delete(`/recomendaciones/${recId}`)
      .set('Authorization', `Bearer ${playerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('DELETE /recomendaciones/:id → 204 borra la recomendación', async () => {
    const del = await request(app)
      .delete(`/recomendaciones/${recId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.statusCode).toBe(204);
  });

  it('DELETE /recomendaciones/:id → 404 si no existe', async () => {
    const res = await request(app)
      .delete('/recomendaciones/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
