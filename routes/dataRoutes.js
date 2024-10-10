const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const path = require('path');

router.get('/nodes', uploadController.getAllNodes);

module.exports = router;
