import * as types from '../../types';

<<<<<<< HEAD
const cookieController: Record<string, types.middlewareFunction> = {};
=======
const cookieController: Record<string, types.MiddlewareFunction> = {};
>>>>>>> dev

// setting cookies

cookieController.setCookie = (req, res, next) => {
  try {
<<<<<<< HEAD
    res.header('Access-Control-Allow-Origin', 'http://saamsa.io');
    const expirationTime = 600000; // 600000 miliseconds or 10 minutes
    const user = res.locals.user;
    console.log('user in setCookie controller', user);
=======
    res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
    const expirationTime = 600000; // 600000 miliseconds or 10 minutes
    const user = res.locals.user;
>>>>>>> dev
    res.cookie('user', user, {
      maxAge: expirationTime,
      httpOnly: true,
      sameSite: 'strict',
      secure: true,
    });
    return next();
  } catch (err) {
    const Error = {
      log: 'Error handler caught an error inside cookieController.setCookie',
      status: 500,
      message: {
        err: `An error occurred inside a middleware named cookieController.setCookie : ${err}`,
      },
    };
    next(Error);
  }
};

// deleting cookies
cookieController.deleteCookies = (req, res, next) => {
  try {
    res.clearCookie('user');
    next();
  } catch (err) {
    const Error = {
      log: 'Error handler caught an error inside cookieController.deleteCookie',
      status: 500,
      message: {
        err: `An error occurred inside a middleware named cookieController.deleteCookie : ${err}`,
      },
    };
    next(Error);
  }
};

export default cookieController;
