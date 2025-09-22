// __tests__/carta.test.js
jest.setTimeout(20000);

const request = require('supertest');
const bcrypt  = require('bcryptjs');
const app     = require('../index');
const pool    = require('../config/db');

let adminToken;
let createdCartaId;

describe('Cartas CRUD', () => {
  beforeAll(async () => {
    // Limpia restos de pruebas anteriores
    await pool.query("DELETE FROM cartas WHERE slug = 'prueba'");
    await pool.query("DELETE FROM usuarios WHERE email = 'admin@test.com'");

    // Crea admin y obtiene token
    const hash = await bcrypt.hash('123456', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, hash_password, role)
       VALUES ($1, $2, $3, 'admin')`,
      ['Adm', 'admin@test.com', hash]
    );
    const loginRes = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: '123456' });
    adminToken = loginRes.body.token;
  });

  it('debería crear una nueva carta con todos los campos', async () => {
    const newCarta = {
      nombre:  'Prueba',
      tipo:    'Aliado',
      fuerza:   5,
      coste:    2,
      raza:    'Humano',
      rareza:  'Azul',
      edicion: 'Reto',
      slug:    'prueba'
    };

    const res = await request(app)
      .post('/cartas')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(newCarta);

    expect(res.statusCode).toBe(201);
    expect(res.body).toMatchObject(newCarta);
    createdCartaId = res.body.id;
  });

  it('debería listar cartas e incluir la creada', async () => {
    const res = await request(app).get('/cartas');
    expect(res.statusCode).toBe(200);

    // Busca la carta por slug y comprueba sus campos
    const carta = res.body.find(c => c.slug === 'prueba');
    expect(carta).toBeDefined();
    expect(carta).toMatchObject({
      nombre:  'Prueba',
      tipo:    'Aliado',
      fuerza:   5,
      coste:    2,
      raza:    'Humano',
      rareza:  'Azul',
      edicion: 'Reto',
      slug:    'prueba'
    });
  });
it('POST /cartas → falla si falta nombre', async () => {
  const res = await request(app)
    .post('/cartas')
    .set('Authorization', `Bearer ${adminToken}`)
    .send({ slug: 'sin-nombre', coste: 2 });
  expect(res.statusCode).toBe(400);
  expect(res.body).toHaveProperty('error');
});

it('POST /cartas → falla si no hay token', async () => {
  const res = await request(app)
    .post('/cartas')
    .send({ nombre: 'SinToken', slug: 'sin-token', coste: 1 });
  expect(res.statusCode).toBe(401);
});

it('POST /cartas → falla si el usuario no es admin', async () => {
  await pool.query("DELETE FROM usuarios WHERE email = 'user@test.com'");
  const hash = await bcrypt.hash('123456', 10);
  await pool.query(
    `INSERT INTO usuarios (nombre, email, hash_password, role)
     VALUES ($1, $2, $3, 'user')`,
    ['User', 'user@test.com', hash]
  );
  const login = await request(app)
    .post('/auth/login')
    .send({ email: 'user@test.com', password: '123456' });
  const token = login.body.token;

  const res = await request(app)
    .post('/cartas')
    .set('Authorization', `Bearer ${token}`)
    .send({ nombre: 'NoAdmin', slug: 'no-admin', coste: 1 });

  expect(res.statusCode).toBe(403);
});

  afterAll(async () => {
    if (createdCartaId) {
      await pool.query("DELETE FROM cartas WHERE id = $1", [createdCartaId]);
    }
    await pool.query("DELETE FROM usuarios WHERE email = 'admin@test.com'");
    await pool.end();
  });
});