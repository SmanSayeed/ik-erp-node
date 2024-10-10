const express = require('express');
require('dotenv').config(); // Load environment variables

Object.keys(require.cache).forEach(function(key) {
  delete require.cache[key];
});

const mainRoutes = require('./routes/mainRoutes');
const powerRoutes = require('./routes/powerRoutes');
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Routes
app.use('/api/main', mainRoutes);
app.use('/api/power', powerRoutes);
app.use('/api/user', userRoutes);
app.use('/api/data', dataRoutes); 

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
