const express = require('express');
require('dotenv').config(); // Load environment variables

Object.keys(require.cache).forEach(function(key) {
  delete require.cache[key];
});

const dbRoutes = require('./routes/dbRoutes');
const clientRoutes = require('./routes/clientRoutes');
const dataRoutes = require('./routes/dataRoutes');
const powerRoutes = require('./routes/powerRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Routes
app.use('/api/power', powerRoutes);
app.use('/api/db', dbRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/data', dataRoutes); 

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
