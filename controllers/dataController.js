const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { sendResponse } = require('../helpers/responseHelper');
const auth = require('../config/auth');
const { getDatabaseFilePath } = require('../helpers/dbHelper');
const allowedUsers = auth.allowedUsers;
const { getMeshData, getNodeDataByMeshId, getNotes } = require('../services/meshService');


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




exports.clientMeshData = async (req, res) => {
  try {
    const clientName = req.query.client_name;
    console.log("client_name - ", clientName);

    if (!clientName) {
      return sendResponse(res, 400, false, 'Client name is required');
    }

    const dbPath = getDatabaseFilePath(clientName);
    const db = new sqlite3.Database(dbPath);

    // Fetch mesh data
    getMeshData(db, (meshErr, meshes) => {
      if (meshErr) {
        return sendResponse(res, 500, false, 'Error retrieving mesh data');
      }

      if (!meshes || meshes.length === 0) {
        return sendResponse(res, 404, false, 'No mesh data found');
      }

      const meshDataWithNodes = [];
      let childData = [];
      let completedMeshes = 0;

      meshes.forEach(mesh => {
        const meshid = mesh._id;
        const meshQueryData = {
          meshid: meshid,
          meshdoc: mesh,
          type: 'mesh',
          meshnodes: []
        };

        // Fetch associated nodes for the mesh
        getNodeDataByMeshId(db, meshid, (nodeErr, nodes) => {
          if (nodeErr) {
            return sendResponse(res, 500, false, 'Error retrieving node data');
          }

          if (nodes && nodes.length > 0) {
            nodes.forEach(node => {
              meshQueryData.meshnodes.push({
                nodeid: node._id,
                type: 'node',
                doc: node,
                extra: node.extra || null
              });
            });
          }

          meshDataWithNodes.push(meshQueryData);
          completedMeshes++;

          // Fetch notes (type:note)
          getNotes(db, (noteErr, notes) => {
            if (noteErr) {
              return sendResponse(res, 500, false, 'Error retrieving note data');
            }

            if (notes && notes.length > 0) {
              childData = notes;
            }

            if (completedMeshes === meshes.length) {
              sendResponse(res, 200, true, 'Mesh data retrieved successfully', {
                meshData: meshDataWithNodes,
                childData: childData.length > 0 ? childData : null
              });
            }
          });
        });
      });
    });

    db.close();
  } catch (error) {
    console.error('Error retrieving client mesh data:', error);
    return sendResponse(res, 500, false, 'Error retrieving client mesh data');
  }
};



exports.childClientMeshData = async (req, res) => {
  try {
    const clientName = req.query.client_name;
    console.log("client_name - ", clientName);

    if (!clientName) {
      return sendResponse(res, 400, false, 'Client name is required');
    }

    const dbPath = getDatabaseFilePath(clientName);
    const db = new sqlite3.Database(dbPath);

    // Step 1: Fetch 'note' entries where value = 'child-client'
    const childClientQuery = `SELECT doc FROM main WHERE type = 'note'`;

    db.all(childClientQuery, [], (err, childClientRows) => {
      if (err) {
        console.error("SQL Error:", err);
        return sendResponse(res, 500, false, 'Error retrieving child client data');
      }

      if (!childClientRows || childClientRows.length === 0) {
        return sendResponse(res, 404, false, 'No child client data found');
      }

      const childClients = childClientRows.map(row => JSON.parse(row.doc));
      const filteredMeshIds = childClients.map(client => client._id.replace('nt', '')); // Extract mesh IDs from 'ntmesh'

      const meshDataWithNodes = [];
      let childData = [];
      let completedMeshes = 0;

      // Step 2: Fetch mesh data
      getMeshData(db, (meshErr, meshes) => {
        if (meshErr) {
          return sendResponse(res, 500, false, 'Error retrieving mesh data');
        }

        // Filter mesh data based on extracted mesh IDs
        const filteredMeshes = meshes.filter(mesh => filteredMeshIds.includes(mesh._id));

        if (filteredMeshes.length === 0) {
          return sendResponse(res, 404, false, 'No matching mesh data found for child client');
        }

        filteredMeshes.forEach(mesh => {
          const meshid = mesh._id;
          const meshQueryData = {
            meshid: meshid,
            meshdoc: mesh,
            type: 'mesh',
            meshnodes: []
          };

          // Fetch nodes for each mesh
          getNodeDataByMeshId(db, meshid, (nodeErr, nodes) => {
            if (nodeErr) {
              return sendResponse(res, 500, false, 'Error retrieving node data');
            }

            if (nodes && nodes.length > 0) {
              nodes.forEach(node => {
                meshQueryData.meshnodes.push({
                  nodeid: node._id,
                  type: 'node',
                  doc: node,
                  extra: node.extra || null
                });
              });
            }

            meshDataWithNodes.push(meshQueryData);
            completedMeshes++;

            // Fetch notes (type:note)
            getNotes(db, (noteErr, notes) => {
              if (noteErr) {
                return sendResponse(res, 500, false, 'Error retrieving note data');
              }

              if (notes && notes.length > 0) {
                childData = notes;
              }

              if (completedMeshes === filteredMeshes.length) {
                sendResponse(res, 200, true, 'Child client mesh data retrieved successfully', {
                  meshData: meshDataWithNodes,
                  childData: childData.length > 0 ? childData : null
                });
              }
            });
          });
        });
      });
    });

    db.close();
  } catch (error) {
    console.error('Error retrieving child client mesh data:', error);
    return sendResponse(res, 500, false, 'Error retrieving child client mesh data');
  }
};




