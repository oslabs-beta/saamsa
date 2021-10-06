import * as express from 'express';
const path = require('path');
import userController from './userController';


const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//logging in
app.post('/login', userController.verifyUser, (req: express.Request,res: express.Response) => {
  console.log("inside the last middleWare");
  console.log(req.body);
  res.status(200).json(res.locals.user);
});

//signing up
app.post('/signup',
  userController.createUser,
  (req: express.Request,res: express.Response) => {
    console.log("inside the last middleWare");
    console.log(res.locals.user);
    res.status(200).send(res.locals.user);
  });

app.use(
  '/',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.sendStatus(201);
  }
);



//type of error object
type errorType = {
  log: string,
  status: number,
  message: {err: string}
};

app.use((err: express.ErrorRequestHandler, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const defaultErr: errorType  = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = { ...defaultErr, ...err };
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});


app.listen(3000, () => console.log('listening on port 3000 :)'));