const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { sendResponse } = require('../helpers/responseHelper');
const { getNodesByType, getNodePowerData } = require('../services/powerService');

// Client Power Data Function
exports.clientPowerData = (req, res) => {
  const userName = req.query.username;
  if (!userName) {
    return sendResponse(res, 400, false, 'Username is required');
  }

  // Define the directory based on the userName
  const dbDir = path.join(__dirname, '..', 'db', userName);

  if (!fs.existsSync(dbDir)) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const dbFile = fs.readdirSync(dbDir).find(file => file.endsWith('.sqlite'));

  if (!dbFile) {
    return sendResponse(res, 404, false, 'Database not found for user');
  }

  const dbPath = path.join(dbDir, dbFile);
  const db = new sqlite3.Database(dbPath);

  // Fetch all node ids from the main table
  getNodesByType(db, 'node', (err, nodes) => {
    if (err) {
      return sendResponse(res, 500, false, 'Error retrieving node data');
    }

    // Fetch power data for these nodes
    getNodePowerData(db, nodes, (err, powerData) => {
      if (err) {
        return sendResponse(res, 500, false, 'Error retrieving power data');
      }

      return sendResponse(res, 200, true, `Power data retrieved successfully. Total records: ${powerData.length}`, powerData);

    });
  });

  db.close();
};

// Child Client Power Data Function
exports.childClientPowerData = (req, res) => {
  const userName = req.query.username;
  if (!userName) {
    return sendResponse(res, 400, false, 'Username is required');
  }

  const dbDir = path.join(__dirname, '..', 'db', userName);
  if (!fs.existsSync(dbDir)) {
    return sendResponse(res, 404, false, 'User not found');
  }

  const dbFile = fs.readdirSync(dbDir).find(file => file.endsWith('.sqlite'));
  if (!dbFile) {
    return sendResponse(res, 404, false, 'Database not found for user');
  }

  const dbPath = path.join(dbDir, dbFile);
  const db = new sqlite3.Database(dbPath);

  // Fetch all child client nodes (nodes related to ntmesh)
  getNodesByType(db, 'note', (err, nodes) => {
    if (err) {
      return sendResponse(res, 500, false, 'Error retrieving child node data');
    }

    getNodePowerData(db, nodes, (err, powerData) => {
      if (err) {
        return sendResponse(res, 500, false, 'Error retrieving power data');
      }

      return sendResponse(res, 200, true, 'Child client power data retrieved successfully', powerData);
    });
  });

  db.close();
};
