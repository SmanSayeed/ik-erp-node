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
        return {
          remotik_power_id: row.id,
          time: new Date(row.time).toISOString(),
          nodeid: row.nodeid,
          power: row.doc.power || 0, // Default to 0 if power field is not present
          node_name: node.name,
        };
      });
  
      callback(null, powerData);
    });
  };
  