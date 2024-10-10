const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { sendResponse } = require('../helpers/responseHelper');
const auth = require('../config/auth');

const allowedUsers = auth.allowedUsers;


// File upload function
exports.uploadDatabase = (req, res) => {
    const pass = req.body.password;
    if(pass !==auth.password) {
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
  
    // Proceed with file handling after verifying userName
    const userDir = path.join(__dirname, '..', 'db', userName);
  
    // Check if user folder exists, if not, create it
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true }); // Ensures that parent directories are created if needed
    }
  
    // Replace the existing SQLite file in the user's folder (if any)
    const filePath = path.join(userDir, file.originalname);
    
    // Remove old SQLite file if it exists
    const existingFiles = fs.readdirSync(userDir);
    const oldFile = existingFiles.find((existingFile) => existingFile.endsWith('.sqlite'));
    
    if (oldFile) {
      fs.unlinkSync(path.join(userDir, oldFile)); // Delete the old SQLite file
    }
  
    // Move the uploaded file to the user's folder
    fs.rename(file.path, filePath, (err) => {
      if (err) {
        return sendResponse(res, 500, false, 'Error saving file');
      }
      sendResponse(res, 200, true, 'File uploaded and replaced successfully');
    });
  };

// Get all user folders
exports.getAllUsers = (req, res) => {
  const dbDir = path.join(__dirname, '..', 'db');
  
  fs.readdir(dbDir, (err, files) => {
    if (err) {
      return sendResponse(res, 500, false, 'Error reading user directories');
    }
    const users = files.filter((file) => fs.lstatSync(path.join(dbDir, file)).isDirectory());
    sendResponse(res, 200, true, 'User list retrieved successfully', users);
  });
};

// Get data from user-specific SQLite database
exports.getUserData = (req, res) => {
  const userName = req.params.username;
  const table = req.params.table;
  const dbDir = path.join(__dirname, '..', 'db', userName);

  if (!fs.existsSync(dbDir)) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const files = fs.readdirSync(dbDir);
  const dbFile = files.find(file => file.endsWith('.sqlite'));

  if (!dbFile) {
    return sendResponse(res, 404, false, 'Database not found for user');
  }

  const dbPath = path.join(dbDir, dbFile);
  const db = new sqlite3.Database(dbPath);

  const query = `SELECT * FROM ${table}`;
  db.all(query, [], (err, rows) => {
    if (err) {
      return sendResponse(res, 500, false, 'Error retrieving data');
    }
    sendResponse(res, 200, true, `${table} table data retrieved successfully`, rows);
  });

  db.close();
};


exports.getAllNodes = (req, res) => {
  // Get username from query params (as form input)
  const userName = req.query.username; // Use req.query for GET requests

  console.log("username - ", userName);

  if (!userName) {
    return sendResponse(res, 400, false, 'Username is required');
  }

  // Define the directory based on the userName
  const dbDir = path.join(__dirname, '..', 'db', userName);

  // Check if user folder exists
  if (!fs.existsSync(dbDir)) {
    return sendResponse(res, 404, false, 'User not found');
  }

  // Find the SQLite database file for the user
  const files = fs.readdirSync(dbDir);
  const dbFile = files.find(file => file.endsWith('.sqlite'));

  if (!dbFile) {
    return sendResponse(res, 404, false, 'Database not found for user');
  }

  const dbPath = path.join(dbDir, dbFile);
  const db = new sqlite3.Database(dbPath);
  console.log("db - ", db);

  // Query to fetch all entries from the main table where type = 'node'
  const query = `SELECT doc FROM main WHERE type = 'node'`;

  db.all(query, [], (err, rows) => {
    if (err) {
      console.log("SQL Error:", err); // Log SQL error for debugging
      return sendResponse(res, 500, false, 'Error retrieving data');
    }

    // Check if rows are returned
    if (!rows || rows.length === 0) {
      return sendResponse(res, 404, false, 'No nodes found');
    }

    try {
      // Parse the doc field and return all nodes
      const nodes = rows.map(row => JSON.parse(row.doc));
      return sendResponse(res, 200, true, 'Nodes retrieved successfully', nodes);
    } catch (parseError) {
      console.error("JSON Parsing Error:", parseError); // Log JSON parse error
      return sendResponse(res, 500, false, 'Error parsing node data');
    }
  });

  db.close();
};

  
