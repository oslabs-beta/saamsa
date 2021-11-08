import createServer from './createServer';
import { connect, ConnectOptions } from 'mongoose';
import { exec } from 'child_process';
import * as path from 'path';
import https from 'https';
import fs from 'fs';
const app = createServer();
const privateKey = fs.readFileSync(
  '/etc/letsencrypt/live/saamsa.io/privkey.pem',
  'utf8'
);
const certificate = fs.readFileSync(
  '/etc/letsencrypt/live/saamsa.io/cert.pem',
  'utf8'
);
const ca = fs.readFileSync('/etc/letsencrypt/live/saamsa.io/chain.pem', 'utf8');
const credentials = {
  key: privateKey,
  cert: certificate,
  ca: ca,
};

const MONGO_URI =
  'mongodb+srv://dbUser:codesmith@cluster-saamsa.vys7y.mongodb.net/saamsa?retryWrites=true&w=majority';
connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'saamsa',
} as ConnectOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    const httpsServer = https.createServer(credentials, app);
    httpsServer.listen(443, () => {
      // exec(`electron ${path.join(__dirname, '../electron/index.js')}`);
      console.log('server listening on port 443 :)');
    });
  })
  .catch((err: Error) =>
    console.log(`Error found inside the mongoose connect method: ${err}`)
  );
