const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { sendResponse } = require('../helpers/responseHelper');
const auth = require('../config/auth');

const allowedUsers = auth.allowedUsers;

// Get all user folders
exports.getAllClients = (req, res) => {
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
  exports.getClientData = (req, res) => {
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