const express = require('express');
const router = express.Router();
const multer = require('multer');
const powerController = require('../controllers/powerController');
const path = require('path');

router.get('/client', powerController.clientPowerData);
router.get('/child', powerController.childClientPowerData);

module.exports = router;
