const express = require('express');
const router = express.Router();
const powerController = require('../controllers/powerController');

router.get('/', powerController.getPowerData);

module.exports = router;
