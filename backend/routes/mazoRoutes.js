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

// públicas
router.get('/', listarMazos);
router.get('/:id', obtenerMazoPorId);

// subrutas para cartas dentro del mazo
const cartaMazoRouter = express.Router({ mergeParams: true });

cartaMazoRouter.get('/', listarCartasEnMazo);
cartaMazoRouter.post('/', verificarToken, agregarCartaAlMazo);
cartaMazoRouter.delete('/:cartaId', verificarToken, eliminarCartaDelMazo);

router.use('/:id/cartas', cartaMazoRouter);

// protegidas (solo admin)
router.post('/', verificarToken, verificarAdmin, crearMazo);
router.put('/:id', verificarToken, verificarAdmin, editarMazo);
router.delete('/:id', verificarToken, verificarAdmin, eliminarMazo);

module.exports = router;
