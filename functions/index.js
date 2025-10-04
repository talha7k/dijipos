const { https } = require('firebase-functions');
const next = require('next');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, conf: { distDir: path.join(__dirname, '..', '.next') } });
const handle = nextApp.getRequestHandler();

exports.nextServer = https.onRequest((req, res) => {
  return nextApp.prepare().then(() => handle(req, res));
});
