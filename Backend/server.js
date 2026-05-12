const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const app = require('./app.js');
const logger = require('./src/config/logger.js');

const PORT = process.env.PORT || 5000;
const isHttps = process.env.IS_HTTPS === 'true';

let server;

if (isHttps) {
  const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, '../certs/localhost-key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '../certs/localhost.pem')),
  };
  server = https.createServer(sslOptions, app);
} else {
  server = http.createServer(app);
}

server.listen(PORT, () => {
  logger.info(`🚀 Inventory Backend running on ${isHttps ? 'https' : 'http'}://localhost:${PORT}`);
});

server.on('error', (error) => {
  logger.error('Server error:', error);
});