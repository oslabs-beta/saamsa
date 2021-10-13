import express from 'express';
import userController from './userController';
import kafkaController from './kafkaController';
function createServer(): express.Application {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  //logging in
  app.post(
    '/login',
    userController.verifyUser,
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

  app.use('/kafka/refresh', kafkaController.refresh);
  app.use('/kafka', kafkaController.getInitial);

  //type of error object
  type errorType = {
    log: string;
    status: number;
    message: { err: string };
  };

  app.use(
    (
      err: express.ErrorRequestHandler,
      req: express.Request,
      res: express.Response
    ) => {
      const defaultErr: errorType = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: { err: 'An error occurred' },
      };
      const errorObj = { ...defaultErr, ...err };
      console.log(errorObj.log);
      return res.status(errorObj.status).json(errorObj.message);
    }
  );
  return app;
}

export default createServer;
