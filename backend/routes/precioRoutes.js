// backend/routes/precioRoutes.js

const express            = require('express');
const { getCardPrices }  = require('../controllers/precioController');
const router             = express.Router();

router.post('/precios', getCardPrices);

module.exports = router;
