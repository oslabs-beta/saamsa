import MiddlewareFunction from '../types';

const cookieController: Record<string, MiddlewareFunction> = {};

// setting cookies
cookieController.setCookie = (req, res, next) => {
try{ 
    const expirationTime = 600000; // 600000 miliseconds or 10 minutes
    const cookieOptions = {
        maxAge: expirationTime,
        httpOnly: true
    };
    res.cookie('user', `${res.locals.user}`, cookieOptions); 
    next();
}
catch (err){
    const Error = {
        log: 'Error handler caught an error inside cookieController.setCookie',
        status: 500,
        message: { err: `An error occurred inside a middleware named cookieController.setCookie : ${err}` }
    };
    next(Error);
}
}

// deleting cookies
cookieController.deleteCookies = (req, res, next) => {

try {
    res.clearCookie('user')
    next();
}

catch (err){
    const Error = {
        log: 'Error handler caught an error inside cookieController.deleteCookie',
        status: 500,
        message: { err: `An error occurred inside a middleware named cookieController.deleteCookie : ${err}` }
    };
    next(Error);

}
}


export default cookieController; 