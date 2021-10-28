import { Schema, model } from 'mongoose';
const bcrypt = require('bcryptjs');
const SALT_WORK_FACTOR = 10;

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
    bcrypt.hash(this.password, SALT_WORK_FACTOR, (err: Error, hash: string) => {
      if (err) return next(err);
      this.password = hash;
      return next();
    });
  }
);

const Users = model<Users>('users', userSchema);

export default Users;
