const fs = require('fs');
const path = require('path');
const { sendResponse } = require('../helpers/responseHelper');
const { getDatabaseFilePath } = require('../helpers/dbHelper');
const auth = require('../config/auth');
const util = require('util');

// Promisify fs functions for async/await usage
const unlinkAsync = util.promisify(fs.unlink);
const renameAsync = util.promisify(fs.rename);
const mkdirAsync = util.promisify(fs.mkdir);

const allowedUsers = auth.allowedUsers;

// File upload function
exports.uploadDatabase = async (req, res) => {
  try {
    const pass = req.body.password;
    if (pass !== auth.password) {
      return sendResponse(res, 400, false, 'Invalid password');
    }
    const file = req.file;
    let userName = req.body.userName; // User-provided userName

    // Validate file
    if (!file) {
      return sendResponse(res, 400, false, 'Missing file');
    }

    // If userName is not provided, extract from the file name
    if (!userName) {
      const fileNameParts = file.originalname.split('_');
      if (fileNameParts.length >= 3) {
        userName = fileNameParts[1]; // Extracts the userName from the file name (remotik_username_time.sqlite)
      } else {
        return sendResponse(res, 400, false, 'Invalid file name format. Expected format: remotik_username_time.sqlite');
      }
    }

    // Check if userName exists in the allowed users array
    if (!allowedUsers.includes(userName)) {
      return sendResponse(res, 400, false, 'Invalid user name. User does not exist in allowed users.');
    }

    // Define the directory based on the userName
    const userDir = path.join(__dirname, '..', 'db', userName);

    // Check if user folder exists, if not, create it
    if (!fs.existsSync(userDir)) {
      await mkdirAsync(userDir, { recursive: true }); // Ensures that parent directories are created if needed
    }

    // Replace the existing SQLite file in the user's folder (if any)
    const existingFiles = fs.readdirSync(userDir);
    const oldFile = existingFiles.find((existingFile) => existingFile.endsWith('.sqlite'));

    if (oldFile) {
      await unlinkAsync(path.join(userDir, oldFile)); // Delete the old SQLite file
    }

    // Move the uploaded file to the user's folder
    const filePath = path.join(userDir, file.originalname);
    await renameAsync(file.path, filePath);

    sendResponse(res, 200, true, 'File uploaded and replaced successfully');
  } catch (error) {
    console.error('Error uploading file:', error);
    sendResponse(res, 500, false, 'Error uploading file');
  }
};
