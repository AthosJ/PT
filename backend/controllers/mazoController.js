// backend/controllers/mazoController.js
const pool = require('../config/db');

async function crearMazo(req, res, next) {
  const { nombre, descripcion } = req.body;
  const usuario_id = req.user?.id;

  if (!nombre || !descripcion || !usuario_id) {
    return res.status(400).json({ error: 'Faltan campos obligatorios' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mazos (nombre, descripcion, usuario_id)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, descripcion, fecha_creacion`,
      [nombre, descripcion, usuario_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function listarMazos(req, res, next) {
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, fecha_creacion
         FROM mazos`
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function obtenerMazoPorId(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, fecha_creacion
         FROM mazos
        WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editarMazo(req, res, next) {
  const { id } = req.params;
  const { nombre, descripcion, cartas } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1) Actualizar nombre/descr si llegaron
    const updates = [];
    const vals = [];
    let idx = 1;
    if (nombre) {
      updates.push(`nombre = $${idx++}`);
      vals.push(nombre);
    }
    if (descripcion) {
      updates.push(`descripcion = $${idx++}`);
      vals.push(descripcion);
    }
    if (updates.length) {
      vals.push(id);
      await client.query(
        `UPDATE mazos SET ${updates.join(', ')} WHERE id = $${idx}`,
        vals
      );
    }

    // 2) Sincronizar cartas si llega el array
    if (Array.isArray(cartas)) {
      // 2.a) Borrar vínculos removidos
      if (cartas.length) {
        const placeholders = cartas.map((_, i) => `$${i + 2}`).join(',');
        await client.query(
          `DELETE FROM mazo_cartas
             WHERE mazo_id = $1
               AND carta_id NOT IN (${placeholders})`,
          [id, ...cartas.map(c => c.id)]
        );
      } else {
        // si el array viene vacío, borra todo
        await client.query(
          `DELETE FROM mazo_cartas WHERE mazo_id = $1`,
          [id]
        );
      }

      // 2.b) Upsert de cada carta
      for (const { id: cartaId, cantidad } of cartas) {
        await client.query(
          `INSERT INTO mazo_cartas (mazo_id, carta_id, cantidad)
             VALUES ($1, $2, $3)
           ON CONFLICT (mazo_id, carta_id)
             DO UPDATE SET cantidad = EXCLUDED.cantidad`,
          [id, cartaId, cantidad]
        );
      }
    }

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Mazo guardado correctamente' });
  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
}

async function eliminarMazo(req, res, next) {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `DELETE FROM mazos WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

module.exports = {
  crearMazo,
  listarMazos,
  obtenerMazoPorId,
  editarMazo,
  eliminarMazo
};
