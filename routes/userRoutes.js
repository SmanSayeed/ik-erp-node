const express = require('express');
const router = express.Router();
const multer = require('multer');
const uploadController = require('../controllers/uploadController');
const path = require('path');

// Set up Multer for file uploads
const upload = multer({
  dest: path.join(__dirname, '..', 'uploads'),
  limits: { fileSize: 1 * 1024 * 1024 * 1024 }, // Limit file size to 1GB
});

// POST API to upload SQLite database
router.post('/upload', upload.single('database'), uploadController.uploadDatabase);

// GET API to retrieve all user folders
router.get('/users', uploadController.getAllUsers);

// GET API to retrieve data from specific user's database (main or power table)
router.get('/:username/:table', uploadController.getUserData);

// router.get('/nodes/:username', uploadController.getAllNodes);

module.exports = router;
