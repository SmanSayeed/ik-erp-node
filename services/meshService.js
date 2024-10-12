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



exports.getMeshDataForClientAndChild = (db, callback) => {
  // Query for parent meshes (extra is null or empty)
  const parentMeshQuery = `SELECT doc FROM main WHERE type = 'mesh' AND (extra IS NULL OR extra = '')`;

  db.all(parentMeshQuery, [], (err, parentRows) => {
    if (err) {
      return callback(err, null);
    }

    // Parse parent mesh data
    const parentMeshes = parentRows.map(row => JSON.parse(row.doc));

    // Query for child meshes (extra is 'child-client')
    const childMeshQuery = `SELECT doc FROM main WHERE type = 'mesh' AND extra = 'child-client'`;

    db.all(childMeshQuery, [], (err, childRows) => {
      if (err) {
        return callback(err, null);
      }

      // Parse child mesh data
      const childMeshes = childRows.map(row => JSON.parse(row.doc));

      // Log filtered results for verification
    

      // Callback with both parent and child meshes
      callback(null, { parentMeshes, childMeshes });
    });
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
