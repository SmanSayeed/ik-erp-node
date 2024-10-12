// Fetch nodes from main table by type (e.g., node or note)
exports.getNodesByType = (db, type, callback) => {
    const query = `SELECT doc FROM main WHERE type = ?`;
    db.all(query, [type], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
  
      const nodes = rows.map(row => JSON.parse(row.doc));
      callback(null, nodes);
    });
  };
  

  exports.getNodesByTypeForClientAndChild = (db, type, childMeshes, callback) => {
    // Select all necessary fields from the main table
    const query = `SELECT id, type, extra, doc FROM main WHERE type = ?`;
    db.all(query, [type], (err, rows) => {
      if (err) {
        return callback(err, null);
      }
  
      const nodes = rows.map(row => {
        const node = JSON.parse(row.doc);
        // Initialize isChild and childName
        let isChild = false;
        let childName = null;
  
        // Check if the node is of type 'node' and has a valid mesh ID
        if (row.type === 'node' && node.meshid) {
          const childMesh = childMeshes.find(mesh => mesh._id === node.meshid);
          if (childMesh) {
            isChild = true;
            childName = childMesh.name; // Assign the child mesh name
          }
        }
  
        // Return the node with additional properties, including id and extra
        return {
          ...node,
          id: row.id,         // Include the node id from the row
          extra: row.extra,   // Include the extra field from the row
          is_child: isChild,
          child_name: childName,
        };
      });
  
      callback(null, nodes);
    });
  };
  
  
  
  // Fetch power data for nodes from the power table
  exports.getNodePowerData = (db, nodes, callback) => {
    const nodeIds = nodes.map(node => node._id); // Collect all node IDs
    const query = `SELECT * FROM power WHERE nodeid IN (${nodeIds.map(() => '?').join(',')})`;
  
    db.all(query, nodeIds, (err, rows) => {
      if (err) {
        return callback(err, null);
      }
  
      const powerData = rows.map(row => {
        const node = nodes.find(n => n._id === row.nodeid);

        let powerValue = 0; // Default to 0 if power field is not present

        try {
            const doc = JSON.parse(row.doc); // Parse the JSON string
            powerValue = doc.power !== undefined ? doc.power : 0; // Extract the power value
        } catch (e) {
            console.error('Failed to parse power doc:', e);
        }


        return {
          remotik_power_id: row.id,
          time: new Date(row.time).toISOString(),
          nodeid: row.nodeid,
          power: powerValue , // Default to 0 if power field is not present
          node_name: node.name,
        };
      });
  
      callback(null, powerData);
    });
  };

  exports.getNodePowerDataWithChild = (db, nodes, parentMeshes, childMeshes, callback) => {
    const nodeIds = nodes.map(node => node._id); // Collect all node IDs
    const query = `SELECT * FROM power WHERE nodeid IN (${nodeIds.map(() => '?').join(',')})`;
  
    db.all(query, nodeIds, (err, rows) => {
      if (err) {
        return callback(err, null);
      }
  
      const powerData = rows.map(row => {
        const node = nodes.find(n => n._id === row.nodeid);
        let powerValue = 0; // Default to 0 if power field is not present
  
        try {
          const doc = JSON.parse(row.doc); // Parse the JSON string in the doc field
          powerValue = doc.power !== undefined ? doc.power : 0; // Extract the power value
        } catch (e) {
          console.error('Failed to parse power doc:', e);
        }
  
        // Identify if node belongs to a child client
        let isChild = false;
        let childName = null;
  
        // Check if node belongs to a child client mesh
        if (node.extra) {
          const childMesh = childMeshes.find(mesh => mesh._id === node.extra);
          if (childMesh) {
            isChild = true;
            childName = childMesh.name; // Use the child mesh name
          }
        }
  
        return {
          remotik_power_id: row.id,
          time: new Date(row.time).toISOString(),
          nodeid: row.nodeid,
          power: powerValue,
          node_name: node.name,
          is_child: isChild,
          child_client_remotik_id: isChild ? childName : null // Assign childName if node is part of a child client
        };
      });
  
      callback(null, powerData);
    });
  };
  
  
  