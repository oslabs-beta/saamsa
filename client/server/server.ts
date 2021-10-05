import * as express from 'express';

const app = express();

app.use(
  '/',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.sendStatus(201);
  }
);
app.listen(3000, () => console.log('listening on port 3000 :)'));
