const express = require('express');
const router = express.Router();
const multer = require('multer');
const dataController = require('../controllers/dataController');
const path = require('path');

router.get('/nodes', dataController.getAllNodes);
router.get('/mesh', dataController.clientMeshData);
router.get('/mesh/child', dataController.getChildClientMeshNodes);

module.exports = router;
