// backend/routes/mazoRoutes.js
const express = require('express');
const {
  crearMazo,
  listarMazos,
  obtenerMazoPorId,
  editarMazo,
  eliminarMazo
} = require('../controllers/mazoController');
const {
  listarCartasEnMazo,
  agregarCartaAlMazo,
  eliminarCartaDelMazo
} = require('../controllers/mazoCartaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Mazos: cada usuario autenticado ve solo los suyos
router.get('/', verificarToken, listarMazos);
router.get('/:id', verificarToken, obtenerMazoPorId);

// Subrutas para gestionar cartas dentro de un mazo
const cartaMazoRouter = express.Router({ mergeParams: true });
cartaMazoRouter.get('/', listarCartasEnMazo);
cartaMazoRouter.post('/', verificarToken, agregarCartaAlMazo);
cartaMazoRouter.delete('/:cartaId', verificarToken, eliminarCartaDelMazo);

router.use('/:id/cartas', cartaMazoRouter);

// Creación, edición y eliminación de mazos (propietario validado en controlador)
router.post('/', verificarToken, crearMazo);
router.put('/:id', verificarToken, editarMazo);
router.delete('/:id', verificarToken, eliminarMazo);

module.exports = router;
