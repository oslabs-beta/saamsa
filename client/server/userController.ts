import * as express from 'express';
const bcrypt = require('bcryptjs');
import userModels from './userModels';

type userController = {
    createUser: (req: express.Request, res: express.Response, next: express.NextFunction) => void,
    verifyUser: (req: express.Request, res: express.Response, next: express.NextFunction) => void;
};

const userController = <userController> {};

userController.createUser = async (req, res, next) => {
    try {

        console.log("in the createUser middleware");
        console.log(req);
      const { username, password } = req.body;
  
      const newUser = {
        username,
        password,
      };
  
      const user = await userModels.findOne({ username });
  
      if (user) return res.send('User already created').status(304);
      console.log("the password from create user method is ", newUser.password);
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
      
      const hashedPW = user.password;
      console.log('hello')
      const compare = bcrypt.compareSync(password, hashedPW);
      console.log("compare: ", compare);
      if (!compare) throw Error('Incorrect username or password. Please try again.');
      console.log('inside the verifyUser middleware');
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