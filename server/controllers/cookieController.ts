import * as types from '../../types';

const cookieController: Record<string, types.middlewareFunction> = {};

// setting cookies

cookieController.setCookie = (req, res, next) => {
  try {
    res.header('Access-Control-Allow-Origin', 'http://saamsa.io');
    const expirationTime = 600000; // 600000 miliseconds or 10 minutes
    const user = res.locals.user;
    console.log('user in setCookie controller', user);
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
