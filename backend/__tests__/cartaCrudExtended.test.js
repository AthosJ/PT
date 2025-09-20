jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcrypt');
const jwt     = require('jsonwebtoken');
const app     = require('../index');
const pool    = require('../config/db');

let adminToken;
let playerToken;
let cartaId;

beforeAll(async () => {
  // 1. Limpieza total de datos de prueba anteriores
  await pool.query("DELETE FROM cartas WHERE slug IN ('ext','new')");
  await pool.query("DELETE FROM usuarios WHERE email IN ('admin3@test.com','player3@test.com')");

  // 2. Crear/actualizar usuario admin3 y obtener token
  const hashAdmin = await bcrypt.hash('admincar', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email)
       DO UPDATE SET hash_password = EXCLUDED.hash_password, role = 'admin'`,
    ['Admin3', 'admin3@test.com', hashAdmin]
  );
  const loginAdmin = await request(app)
    .post('/auth/login')
    .send({ email: 'admin3@test.com', password: 'admincar' });
  if (!loginAdmin.body.token) throw new Error('Login admin falló');
  adminToken = loginAdmin.body.token;

  // 3. Crear/actualizar usuario player3 y obtener token
  const hashPlayer = await bcrypt.hash('playerCar', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'jugador')
     ON CONFLICT (email)
       DO UPDATE SET hash_password = EXCLUDED.hash_password, role = 'jugador'`,
    ['Player3', 'player3@test.com', hashPlayer]
  );
  const loginPlayer = await request(app)
    .post('/auth/login')
    .send({ email: 'player3@test.com', password: 'playerCar' });
  if (!loginPlayer.body.token) throw new Error('Login jugador falló');
  playerToken = loginPlayer.body.token;

  // 4. Crear carta de prueba con adminToken
  const createRes = await request(app)
    .post('/cartas')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({
      nombre:  'Ext',
      tipo:    'Aliado',
      fuerza:   5,
      coste:    2,
      raza:    'Elfo',
      rareza:  'Verde',
      edicion: 'Demo',
      slug:    'ext'
    });
  cartaId = createRes.body.id;
  if (!cartaId) throw new Error('No se creó la carta inicial');
});

afterAll(async () => {
  // Limpieza final
  await pool.query("DELETE FROM cartas WHERE slug IN ('ext','new')");
  await pool.query("DELETE FROM usuarios WHERE email IN ('admin3@test.com','player3@test.com')");
  await pool.end();
});

describe('Cartas CRUD extendido', () => {
  it('GET /cartas → lista todas las cartas', async () => {
    const res = await request(app).get('/cartas');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some(c => c.slug === 'ext')).toBe(true);
  });

  it('POST /cartas → 401 si no hay token', async () => {
    const res = await request(app)
      .post('/cartas')
      .send({ nombre: 'Nueva', slug: 'new', coste: 1 });
    expect(res.statusCode).toBe(401);
  });

  it('POST /cartas → 403 si no es admin', async () => {
    const res = await request(app)
      .post('/cartas')
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ nombre: 'Nueva', slug: 'new', coste: 1 });
    expect(res.statusCode).toBe(403);
  });

  it('POST /cartas → 400 si faltan campos', async () => {
    const res = await request(app)
      .post('/cartas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ slug: 'new' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('POST /cartas → 201 crea una nueva carta', async () => {
    const res = await request(app)
      .post('/cartas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nombre:  'Nueva',
        tipo:    'Aliado',
        fuerza:   1,
        coste:    1,
        raza:    'Humano',
        rareza:  'Rojo',
        edicion: 'Test',
        slug:    'new'
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('PUT /cartas/:id → 401 si no hay token', async () => {
    const res = await request(app).put(`/cartas/${cartaId}`).send({ fuerza: 9 });
    expect(res.statusCode).toBe(401);
  });

  it('PUT /cartas/:id → 403 si no es admin', async () => {
    const res = await request(app)
      .put(`/cartas/${cartaId}`)
      .set('Authorization', `Bearer ${playerToken}`)
      .send({ fuerza: 9 });
    expect(res.statusCode).toBe(403);
  });

  it('PUT /cartas/:id → 400 si no body', async () => {
    const res = await request(app)
      .put(`/cartas/${cartaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('PUT /cartas/:id → 200 edita un campo', async () => {
    const res = await request(app)
      .put(`/cartas/${cartaId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fuerza: 9 });
    expect(res.statusCode).toBe(200);
    expect(res.body.fuerza).toBe(9);
  });

  it('PUT /cartas/:id → 404 si id no existe', async () => {
    const res = await request(app)
      .put('/cartas/999999')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ fuerza: 1 });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE /cartas/:id → 401 si no hay token', async () => {
    const res = await request(app).delete(`/cartas/${cartaId}`);
    expect(res.statusCode).toBe(401);
  });

  it('DELETE /cartas/:id → 403 si no es admin', async () => {
    const res = await request(app)
      .delete(`/cartas/${cartaId}`)
      .set('Authorization', `Bearer ${playerToken}`);
    expect(res.statusCode).toBe(403);
  });

  it('DELETE /cartas/:id → 204 borra la carta', async () => {
    const del = await request(app)
      .delete(`/cartas/${cartaId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(del.statusCode).toBe(204);

    const list = await request(app).get('/cartas');
    expect(list.body.find(c => c.id === cartaId)).toBeUndefined();
  });

  it('DELETE /cartas/:id → 404 si id no existe', async () => {
    const res = await request(app)
      .delete('/cartas/999999')
      .set('Authorization', `Bearer ${adminToken}`);
    expect(res.statusCode).toBe(404);
  });
});
