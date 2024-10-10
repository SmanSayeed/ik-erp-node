const sqlite3 = require('sqlite3').verbose();

// Function to fetch mesh data
exports.getMeshData = (db, callback) => {
  const meshQuery = `SELECT doc FROM main WHERE type = 'mesh'`;

  db.all(meshQuery, [], (err, meshRows) => {
    if (err) {
      return callback(err, null);
    }

    const meshes = meshRows.map(row => JSON.parse(row.doc)); // Parse the 'mesh' data
    callback(null, meshes);
  });
};

// Function to fetch nodes associated with a mesh ID
exports.getNodeDataByMeshId = (db, meshid, callback) => {
  const nodeQuery = `SELECT doc FROM main WHERE type = 'node' AND extra = '${meshid}'`;

  db.all(nodeQuery, [], (err, nodeRows) => {
    if (err) {
      return callback(err, null);
    }

    const nodes = nodeRows.map(row => JSON.parse(row.doc));
    callback(null, nodes);
  });
};

// Function to fetch notes
exports.getNotes = (db, callback) => {
  const noteQuery = `SELECT doc FROM main WHERE type = 'note'`;

  db.all(noteQuery, [], (err, noteRows) => {
    if (err) {
      return callback(err, null);
    }

    const notes = noteRows.map(row => JSON.parse(row.doc));
    callback(null, notes);
  });
};
