// backend/controllers/mazoController.js
const pool = require('../config/db');

async function crearMazo(req, res, next) {
  const { nombre, descripcion } = req.body;
  const usuario_id = req.user.id;

  if (!nombre) {
    return res.status(400).json({ error: 'El nombre es obligatorio' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO mazos (nombre, descripcion, usuario_id)
       VALUES ($1, $2, $3)
       RETURNING id, nombre, descripcion, fecha_creacion;`,
      [nombre, descripcion || '', usuario_id]
    );
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function listarMazos(req, res, next) {
  const usuario_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, fecha_creacion
         FROM mazos
        WHERE usuario_id = $1
     ORDER BY fecha_creacion DESC;`,
      [usuario_id]
    );
    return res.status(200).json(result.rows);
  } catch (err) {
    next(err);
  }
}

async function obtenerMazoPorId(req, res, next) {
  const { id } = req.params;
  const usuario_id = req.user.id;
  try {
    const result = await pool.query(
      `SELECT id, nombre, descripcion, fecha_creacion
         FROM mazos
        WHERE id = $1 AND usuario_id = $2;`,
      [id, usuario_id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    return res.status(200).json(result.rows[0]);
  } catch (err) {
    next(err);
  }
}

async function editarMazo(req, res, next) {
  const { id } = req.params;
  const usuario_id = req.user.id;
  const { nombre, descripcion, cartas } = req.body;

  try {
    // 0) Verificar ownership
    const owner = await pool.query(
      `SELECT usuario_id FROM mazos WHERE id = $1;`,
      [id]
    );
    if (owner.rowCount === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    if (owner.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No autorizado para modificar este mazo' });
    }

    // 1) Actualizar nombre y/o descripción
    const updates = [];
    const values = [];
    let idx = 1;
    if (nombre) {
      updates.push(`nombre = $${idx++}`);
      values.push(nombre);
    }
    if (descripcion) {
      updates.push(`descripcion = $${idx++}`);
      values.push(descripcion);
    }
    if (updates.length) {
      values.push(id);
      await pool.query(
        `UPDATE mazos SET ${updates.join(', ')} WHERE id = $${idx};`,
        values
      );
    }

    // 2) Sincronizar cartas si llega array “cartas”
    if (Array.isArray(cartas)) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        // a) Borrar vínculos que ya no existen
        if (cartas.length) {
          const placeholders = cartas.map((_, i) => `$${i + 2}`).join(',');
          await client.query(
            `DELETE FROM mazo_cartas
               WHERE mazo_id = $1
                 AND carta_id NOT IN (${placeholders});`,
            [id, ...cartas.map(c => c.id)]
          );
        } else {
          await client.query(
            `DELETE FROM mazo_cartas WHERE mazo_id = $1;`,
            [id]
          );
        }
        // b) Upsert cada carta
        for (const { id: cartaId, cantidad } of cartas) {
          await client.query(
            `INSERT INTO mazo_cartas (mazo_id, carta_id, cantidad)
               VALUES ($1, $2, $3)
             ON CONFLICT (mazo_id, carta_id)
               DO UPDATE SET cantidad = EXCLUDED.cantidad;`,
            [id, cartaId, cantidad]
          );
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
        throw err;
      } finally {
        client.release();
      }
    }

    return res.status(200).json({ message: 'Mazo guardado correctamente' });
  } catch (err) {
    next(err);
  }
}

async function eliminarMazo(req, res, next) {
  const { id } = req.params;
  const usuario_id = req.user.id;

  try {
    // 0) Verificar ownership
    const owner = await pool.query(
      `SELECT usuario_id FROM mazos WHERE id = $1;`,
      [id]
    );
    if (owner.rowCount === 0) {
      return res.status(404).json({ error: 'Mazo no encontrado' });
    }
    if (owner.rows[0].usuario_id !== usuario_id) {
      return res.status(403).json({ error: 'No autorizado para eliminar este mazo' });
    }

    // 1) Elimina el mazo; las cartas se borran en cascada
    await pool.query(
      `DELETE FROM mazos WHERE id = $1;`,
      [id]
    );
    return res.sendStatus(204);
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

