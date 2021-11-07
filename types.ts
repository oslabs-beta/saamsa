import * as express from 'express';

export type consumerListElement = {
  groups: [
    {
      groupId: string;
      members: [
        {
          clientId: string;
          memberId: string;
          stringifiedMetadata: string;
        }
      ];
    }
  ];
};

export type middlewareFunction = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => void;