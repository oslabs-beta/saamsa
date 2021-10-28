import express from 'express';
import userController from './controllers/userController';
import cookieController from './controllers/cookieController';
import sessionController from './controllers/sessionController';
import router from './routers/kafkaRouter';
import cookieParser from 'cookie-parser';
import * as path from 'path';

function createServer(): express.Application {
  const app = express();

  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/build', express.static(path.join(__dirname, '../../build')));

  // make sure no one is logged in before
  app.get('/sessions', sessionController.isLoggedIn, (req, res) => {
    res.status(200).json(res.locals.user);
  });

  //logging in
  app.post(
    '/login',
    userController.verifyUser,
    // cookieController.setCookie,
    // sessionController.startSession,
    (req: express.Request, res: express.Response) => {
      res.status(200).json(res.locals.user);
    }
  );

  //signing up
  app.post(
    '/signup',
    userController.createUser,
    (req: express.Request, res: express.Response) => {
      res.status(200).send(res.locals.user);
    }
  );

  // logging out
  app.post(
    '/logout',
    // sessionController.endSession,
    // cookieController.deleteCookies,
    (req, res) => {
      res.sendStatus(200);
    }
  );

  app.use('/kafka', router);

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../index.html'));
  });
  //type of error object
  type errorType = {
    log: string;
    status: number;
    message: { err: string };
  };
  //404 error handler
  app.use('*', (req, res) => {
    res.sendStatus(404);
  });
  //global error handler
  app.use(
    (
      err: express.ErrorRequestHandler,
      req: express.Request,
      res: express.Response,
      next: express.NextFunction
    ) => {
      const defaultErr: errorType = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: { err: 'An error occurred' },
      };
      const errorObj = { ...defaultErr, ...err };
      console.log(err);
      return res.status(errorObj.status).json(errorObj.message);
    }
  );

  return app;
}

export default createServer;
