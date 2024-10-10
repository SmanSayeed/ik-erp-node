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

module.exports = router;