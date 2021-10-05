
const path = require('path');

const express=require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

//type of error object
type errorType = {
    log: string,
    status: number,
    message: {err: string}
};

app.use((err: Error , req: Request, res: Response, next: any) => {
    const defaultErr: errorType  = {
        log: 'Express error handler caught unknown middleware error',
        status: 500,
        message: { err: 'An error occurred' },
      };
      const errorObj = { ...defaultErr, ...err };
      console.log(errorObj.log);
      return res.status(errorObj.status).json(errorObj.message);
})

app.listen(3000, () => console.log('Listening on 3000'));


