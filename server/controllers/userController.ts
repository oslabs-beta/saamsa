
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
    let hashedPW;
    let compare;

    const user = await userModels.findOne({ username });
    if(user){
      hashedPW = user!.password;
      compare = bcrypt.compareSync(password, hashedPW);
    }
    if (!compare || !user){
      throw Error('Incorrect username or password. Please try again.');
    }
      else{
        res.locals.user = username;
      }
    next();
  } catch (err) {
    next({
      log: 'Express error handler caught in userController.verifyUser middleware',
      status: 503,
      err
    });
  }
};

export default userController;
