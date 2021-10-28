import * as express from 'express';

type MiddlewareFunction = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction,
) => void;

export default MiddlewareFunction;
