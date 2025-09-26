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
const { verificarToken } = require('../middleware/authMiddleware');

const router = express.Router();

// Aplica autenticación a todas las rutas de este router
router.use(verificarToken);

// CRUD de mazos
router.get('/', listarMazos);
router.get('/:id', obtenerMazoPorId);
router.post('/', crearMazo);
router.put('/:id', editarMazo);
router.delete('/:id', eliminarMazo);

// Subrutas de cartas dentro de un mazo
const cartaMazoRouter = express.Router({ mergeParams: true });
cartaMazoRouter.get('/', listarCartasEnMazo);
cartaMazoRouter.post('/', agregarCartaAlMazo);
cartaMazoRouter.delete('/:cartaId', eliminarCartaDelMazo);
router.use('/:id/cartas', cartaMazoRouter);

module.exports = router;

