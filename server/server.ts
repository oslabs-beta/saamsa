import createServer from './createServer';
import { connect, ConnectOptions } from 'mongoose';
import { exec } from 'child_process';
import * as path from 'path';
const app = createServer();

const MONGO_URI =
  'mongodb+srv://dbUser:codesmith@cluster-saamsa.vys7y.mongodb.net/saamsa?retryWrites=true&w=majority';
connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'saamsa',
} as ConnectOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(80, () => {
      console.log('server listening on port 80 :)');
    });
  })
  .catch((err: Error) =>
    console.log(`Error found inside the mongoose connect method: ${err}`)
  );
