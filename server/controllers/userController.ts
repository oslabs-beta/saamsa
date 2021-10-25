import * as express from 'express';
const bcrypt = require('bcryptjs');
import userModels from '../models/userModels';

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
    const defaultErr = {
      log: 'Express error handler caught an error in userController.createUser middleware',
      status: 500,
      message: { err: `An error occurred inside a middleware named userController.createUser : ${err}` },
    };
    return next(defaultErr);
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
    const defaultErr = {
      log: 'Express error handler caught an error in userController.verifyUser middleware',
      status: 401,
      message: { err: `An error occurred inside a middleware named userController.verifyUser middleware: ${err}` },
    }
    return next(defaultErr);
  }
};

export default userController;
