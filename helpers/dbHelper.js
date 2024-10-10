const fs = require('fs');
const path = require('path');

// Helper to find SQLite database file for a user
exports.getDatabaseFilePath = (userName) => {
  const dbDir = path.join(__dirname, '..', 'db', userName);

  // Check if user folder exists
  if (!fs.existsSync(dbDir)) {
    throw new Error('User not found');
  }

  // Find the SQLite database file for the user
  const files = fs.readdirSync(dbDir);
  const dbFile = files.find(file => file.endsWith('.sqlite'));

  if (!dbFile) {
    throw new Error('Database not found for user');
  }

  return path.join(dbDir, dbFile);
};
