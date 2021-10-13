import * as express from 'express';
import { connect, ConnectOptions } from 'mongoose';
import userModels from './userModels';

const MONGO_URI =
  'mongodb+srv://dbUser:codesmith@cluster0.drsef.mongodb.net/saamsa?retryWrites=true&w=majority';

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

type userController = {
  createUser: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
  verifyUser: (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => void;
};

const userController = <userController>{};

userController.createUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const newUser = {
      username,
      password,
    };
    const user = await userModels.findOne({ username });

    if (user) return res.send('User already created').status(304);
    console.log('the password from create user method is ', newUser.password);
    await userModels.create(newUser);
    console.log(`User: ${username} signed up`);
    res.locals.user = username;
    return next();
  } catch (err) {
    console.log(err);
    return next({
      log: 'Express error handler caught in userController.createUser middleware',
      status: 500,
      message: { err },
    });
  }
};

userController.verifyUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    const user = await userModels.findOne({ username });

    const hashedPW = user!.password;
    console.log('hello');
    const compare = bcrypt.compareSync(password, hashedPW);
    console.log('compare: ', compare);
    if (!compare)
      throw Error('Incorrect username or password. Please try again.');
    console.log(`User: ${username} logged in`);
    res.locals.user = username;
    next();
  } catch (err) {
    next({
      log: 'Express error handler caught in userController.verifyUser middleware',
      status: 500,
      message: { err },
    });
  }
};

export default userController;
