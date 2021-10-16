import * as express from 'express';
const bcrypt = require('bcryptjs');
import userModels from './userModels';

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
    if (user) return res.status(304).send('User already created');
    await userModels.create(newUser);
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
    const compare = bcrypt.compareSync(password, hashedPW);
    if (!compare)
      throw Error('Incorrect username or password. Please try again.');
    res.locals.user = username;
    next();
  } catch (err) {
    next({
      log: 'Express error handler caught in userController.verifyUser middleware',
      status: 401,
      message: { err },
    });
  }
};

export default userController;
