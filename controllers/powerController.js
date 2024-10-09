const db = require('../config/dbConfig');

exports.getPowerData = (req, res) => {
  const query = 'SELECT * FROM power';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
};
