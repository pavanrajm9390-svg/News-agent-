require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Initialize DB schema on start
require('./db/init');

const routes = require('./routes');
const { startScheduler } = require('./services/scheduler');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api', routes);

app.get('/', (req, res) => {
  res.json({
    name: 'News Briefing Backend',
    version: '1.0.0',
    endpoints: [
      'GET  /api/health',
      'GET  /api/sources',
      'POST /api/run',
      'GET  /api/briefings',
      'GET  /api/briefings/:id',
      'POST /api/briefings/:id/post',
    ],
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
  startScheduler();
});
