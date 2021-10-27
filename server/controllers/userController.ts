
const bcrypt = require('bcryptjs');
import userModels from '../models/userModels';
import MiddlewareFunction from '../types';


const userController: Record<string, MiddlewareFunction> = {};

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
    let hashedPW;
    let compare;

    const user = await userModels.findOne({ username });
    if(user){
      hashedPW = user!.password;
      compare = bcrypt.compareSync(password, hashedPW);
    }
    if (!compare || !user){
      res.locals.message = 'Incorrect username or password. Please try again.';
      res.status(401).json(res.locals.message)
      console.log(res.locals.message);
    }
      else{
        res.locals.user = username;
        res.status(200).json(res.locals.user);
      }
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
