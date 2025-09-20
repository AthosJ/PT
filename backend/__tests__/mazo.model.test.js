// __tests__/mazo.model.test.js
const pool = require('../config/db');
const {
  crearMazo,
  listarMazos,
  editarMazo,
  eliminarMazo
} = require('../models/Mazo');

describe('Modelo Mazo', () => {
  let mazoId;

  it('debería crear un mazo', async () => {
    const nuevo = await crearMazo({ nombre: 'Mi Mazo', descripcion: 'Test' });
    expect(nuevo).toHaveProperty('id');
    expect(nuevo).toMatchObject({ nombre: 'Mi Mazo', descripcion: 'Test' });
    mazoId = nuevo.id;
  });

  it('debería listar mazos e incluir el creado', async () => {
    const arr = await listarMazos();
    expect(Array.isArray(arr)).toBe(true);
    expect(arr.find(m => m.id === mazoId)).toBeDefined();
  });

  it('debería editar un mazo', async () => {
    const mod = await editarMazo(mazoId, { descripcion: 'Actualizado' });
    expect(mod.descripcion).toBe('Actualizado');
  });

  it('debería eliminar un mazo', async () => {
    await eliminarMazo(mazoId);
    const arr = await listarMazos();
    expect(arr.find(m => m.id === mazoId)).toBeUndefined();
  });

  afterAll(() => pool.end());
});