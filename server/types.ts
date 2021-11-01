import * as express from 'express';

export type MiddlewareFunction = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void;
