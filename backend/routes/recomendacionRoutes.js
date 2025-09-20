const express = require('express');
const {
  listarRecomendaciones,
  crearRecomendacion,
  editarRecomendacion,
  eliminarRecomendacion
} = require('../controllers/recomendacionController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Listar por mazo (público o con query param /param)
router.get('/', listarRecomendaciones);
router.get('/:mazoId', listarRecomendaciones);

// CRUD protegido (solo admin)
router.post('/', verificarToken, verificarAdmin, crearRecomendacion);
router.put('/:id', verificarToken, verificarAdmin, editarRecomendacion);
router.delete('/:id', verificarToken, verificarAdmin, eliminarRecomendacion);

module.exports = router;
