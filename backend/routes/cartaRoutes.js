// backend/routes/cartaRoutes.js
/*const express = require('express');
const {
  listarCartas,
  crearCarta,
  editarCarta,
  eliminarCarta
} = require('../controllers/cartaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listarCartas);
router.post('/', verificarToken, verificarAdmin, crearCarta);
router.put('/:id', verificarToken, verificarAdmin, editarCarta);
router.delete('/:id', verificarToken, verificarAdmin, eliminarCarta);

module.exports = router;
 */ //modificado 17-09-2025


/*const express = require('express');
const {
  listarCartas,
  obtenerCartaPorId,
  crearCarta,
  editarCarta,
  eliminarCarta
} = require('../controllers/cartaController');

const router = express.Router();

router.get('/', listarCartas);
router.get('/:id', obtenerCartaPorId);
router.post('/', crearCarta);
router.put('/:id', editarCarta);
router.delete('/:id', eliminarCarta);

module.exports = router;*/ 
//modificado 17-09-2025 17:11

// backend/routes/cartaRoutes.js
const express = require('express');
const {
  listarCartas,
  obtenerCartaPorId,
  crearCarta,
  editarCarta,
  eliminarCarta
} = require('../controllers/cartaController');
const { verificarToken, verificarAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Rutas públicas: cualquiera (incluso sin token) puede listar o ver detalles de cartas
router.get('/', listarCartas);
router.get('/:id', obtenerCartaPorId);

// Rutas protegidas: solo ADMIN puede crear, editar o eliminar cartas
router.post('/',   verificarToken, verificarAdmin, crearCarta);
router.put('/:id', verificarToken, verificarAdmin, editarCarta);
router.delete('/:id', verificarToken, verificarAdmin, eliminarCarta);

module.exports = router;



