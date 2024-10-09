const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config(); // Load .env variables

const db = new sqlite3.Database(path.resolve(process.env.DB_PATH), (err) => {
  if (err) {
    console.error('Error connecting to the SQLite database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

module.exports = db;
