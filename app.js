const express = require('express');
require('dotenv').config(); // Load environment variables

const mainRoutes = require('./routes/mainRoutes');
const powerRoutes = require('./routes/powerRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Routes
app.use('/api/main', mainRoutes);
app.use('/api/power', powerRoutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
