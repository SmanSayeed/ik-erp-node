const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { sendResponse } = require('../helpers/responseHelper');
const { getNodesByType, getNodePowerData, getNodePowerDataWithChild, getNodesByTypeForClientAndChild } = require('../services/powerService');
const { getDatabaseFilePath } = require('../helpers/dbHelper');
const { getNodeDataByMeshId, getMeshData, getMeshDataForClientAndChild } = require('../services/meshService');

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


/* power usage of child client */

exports.getChildClientPowerData = (req, res) => {
  const userName = req.query.username;

  if (!userName) {
      return sendResponse(res, 400, false, 'Username is required');
  }

  const dbPath = getDatabaseFilePath(userName);
  const db = new sqlite3.Database(dbPath);

  const query = "SELECT * FROM main WHERE type = 'mesh' AND extra = 'child-client'";

  db.all(query, (err, meshes) => {
      if (err) {
          return sendResponse(res, 500, false, 'Error retrieving child clients');
      }

      const nodes = [];

      let completedMeshes = 0;

      meshes.forEach(mesh => {
          getNodeDataByMeshId(db, mesh.id, (nodeErr, meshNodes) => {
              if (nodeErr) {
                  return sendResponse(res, 500, false, 'Error retrieving nodes');
              }

              nodes.push(...meshNodes);
              completedMeshes++;

              if (completedMeshes === meshes.length) {
                  // Now retrieve the power data for the nodes
                  getNodePowerData(db, nodes, (err, powerData) => {
                      if (err) {
                          return sendResponse(res, 500, false, 'Error retrieving power data');
                      }

                      return sendResponse(res, 200, true, `Power data retrieved successfully. Total records: ${powerData.length}`, powerData);
                  });
              }
          });
      });
  });

  db.close();
};


exports.clientPowerDataWithChildren = (req, res) => {
  const userName = req.query.username;
  if (!userName) {
    return sendResponse(res, 400, false, 'Username is required');
  }

  try {
    const dbPath = getDatabaseFilePath(userName); // Helper to get db path
    const db = new sqlite3.Database(dbPath);

    // Fetch mesh data (parent and child clients)
    getMeshDataForClientAndChild(db, (err, meshData) => {
      if (err) {
        db.close(); // Ensure DB is closed in case of error
        return sendResponse(res, 500, false, 'Error retrieving mesh data');
      }

      const { parentMeshes, childMeshes } = meshData;
      // console.log("Parent Meshes:", parentMeshes);
      // console.log("Child Meshes:", childMeshes);

      // Fetch nodes for the clients (both parent and child), pass childMeshes
      getNodesByTypeForClientAndChild(db, 'node', childMeshes, (err, nodes) => {
        if (err) {
          db.close(); // Ensure DB is closed in case of error
          return sendResponse(res, 500, false, 'Error retrieving node data');
        }

        console.log("nodes = ", nodes);

        // Get power data with child client identification
        getNodePowerDataWithChild(db, nodes, parentMeshes, childMeshes, (err, powerData) => {
          db.close(); // Close DB after finishing all operations

          if (err) {
            return sendResponse(res, 500, false, 'Error retrieving power data');
          }

          return sendResponse(res, 200, true, `Power data retrieved successfully. Total records: ${powerData.length}`, powerData);
        });
      });
    });

  } catch (error) {
    return sendResponse(res, 500, false, error.message);
  }
};




