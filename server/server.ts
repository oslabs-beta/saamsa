import createServer from './createServer';
import { connect, ConnectOptions } from 'mongoose';
import { exec } from 'child_process';
import path from 'path';
const app = createServer();

const MONGO_URI =
  'mongodb+srv://dbUser:codesmith@cluster0.drsef.mongodb.net/saamsa?retryWrites=true&w=majority';
// 'mongodb+srv://dbUser:codesmith@cluster0.drsef.mongodb.net/saamsa?retryWrites=true&w=majority';
connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'saamsa',
} as ConnectOptions)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3001, () => {
      exec(`electron ${path.resolve(__dirname, '../electron/index.js')}`);
      console.log('server listening on port 3001 :)');
    });
  })
  .catch((err: Error) =>
    console.log(`Error found inside the mongoose connect method: ${err}`)
  );
