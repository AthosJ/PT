// backend/routes/mazoRoutes.js
const express = require('express');
const {
  crearMazo,
  listarMazos,
  obtenerMazoPorId,
  editarMazo,
  eliminarMazo
} = require('../controllers/mazoController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// públicas
router.get('/', listarMazos);
router.get('/:id', obtenerMazoPorId);

// protegidas (solo admin)
router.post('/', verificarToken, verificarAdmin, crearMazo);
router.put('/:id', verificarToken, verificarAdmin, editarMazo);
router.delete('/:id', verificarToken, verificarAdmin, eliminarMazo);

module.exports = router;
