const db = require('../config/dbConfig');

exports.getMainData = (req, res) => {
  const query = 'SELECT * FROM main';
  db.all(query, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ data: rows });
    }
  });
};
