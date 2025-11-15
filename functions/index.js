import { https } from 'firebase-functions';
import next from 'next';
import path from 'path';

const dev = process.env.NODE_ENV !== 'production';
const nextApp = next({ dev, conf: { distDir: path.join(process.cwd(), '.next') } });
const handle = nextApp.getRequestHandler();

export const nextServer = https.onRequest((req, res) => {
  return nextApp.prepare().then(() => handle(req, res));
});
