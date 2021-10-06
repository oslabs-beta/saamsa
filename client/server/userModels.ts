import { Schema,model } from 'mongoose';
import * as express from 'express';
const mongoose = require('mongoose');

const MONGO_URI: string = 'mongodb+srv://dbUser:codesmith@cluster0.drsef.mongodb.net/saamsa?retryWrites=true&w=majority';

const SALT_WORK_FACTOR: number = 10;
const bcrypt = require('bcryptjs');

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'saamsa',})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err: any) => console.log(`Error found inside the mongoose connect method: ${err}`));


 interface Users {
    username: string;
    password: string;
  }

  const userSchema: Schema<Users> = new Schema({
    username: { type: String},
    password: { type: String},
});
// the below method runs right before the document is saved on the db.
userSchema.pre<Users>('save', function (this: Users, next: (err? : Error | undefined) => void) {  
  console.log("request body is ",express.request.body);
  console.log("The this password is ", this.password);
  bcrypt.hash(this.password, SALT_WORK_FACTOR, (err: Error, hash: string) => {
      if(err) return next(err);
      this.password = hash;
      return next();
  })
  });

 const Users = model <Users>('users', userSchema);

export default Users;
