const express = require('express');
const router = express.Router();
const multer = require('multer');
const powerController = require('../controllers/powerController');
const path = require('path');

router.get('/client', powerController.clientPowerData);
router.get('/child', powerController.getChildClientPowerData);

router.get('/client-child', powerController.clientPowerDataWithChildren);

router.get('/data', powerController.powerData);

module.exports = router;
