import { Schema, model, connect, ConnectOptions } from 'mongoose';
import * as express from 'express';

const MONGO_URI ='mongodb+srv://dbUser:saamsacodesmith@cluster-saamsa.vys7y.mongodb.net/saamsa?retryWrites=true&w=majority';
  

const SALT_WORK_FACTOR = 10;
const bcrypt = require('bcryptjs');

connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  dbName: 'saamsa',
} as ConnectOptions)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err: Error) =>
    console.log(`Error found inside the mongoose connect method: ${err}`)
  );

interface Users {
  username: string;
  password: string;
}

const userSchema: Schema<Users> = new Schema({
  username: { type: String },
  password: { type: String },
});
// the below method runs right before the document is saved on the db.
userSchema.pre<Users>(
  'save',
  function (this: Users, next: (err?: Error | undefined) => void) {
    console.log('request body is ', express.request.body);
    console.log('The this password is ', this.password);
    bcrypt.hash(this.password, SALT_WORK_FACTOR, (err: Error, hash: string) => {
      if (err) return next(err);
      this.password = hash;
      return next();
    });
  }
);

const Users = model<Users>('users', userSchema);

export default Users;
