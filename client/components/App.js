"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __importStar(require("react"));
var LoginPage_1 = __importDefault(require("./LoginPage"));
// class User { 
//   constructor(){
//   username: string,
//   password: string,
//   }
// }
var App = function () {
    var _a = React.useState(false), loginStatus = _a[0], changeLoginStatus = _a[1];
    var _b = React.useState(null), loginAttempt = _b[0], changeAttempt = _b[1];
    var _c = React.useState(), currentUser = _c[0], changeUser = _c[1];
    var _d = React.useState(), rendering = _d[0], setRendering = _d[1];
    var loginButton = function () {
        var username = document.querySelector('#username').value;
        var password = document.querySelector('#password').value;
        if (username == '' || password == '') {
            var result = 'Please fill out the username and password fields to log in';
            changeAttempt(result);
        }
        else {
            var user = {
                username: username,
                password: password
            };
            fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            })
                .then((function (res) { return res.json(); }))
                .catch(function (err) { return changeAttempt('Incorrect Username or password'); });
        }
    };
    var signUp = function () {
        var username = document.querySelector('#username').value;
        var password = document.querySelector('#password').value;
        if (username == '' || password == '') {
            var result = 'Please fill out the username and password fields';
            changeAttempt(result);
        }
        else if (password.length < 6) {
            var result = "Please create a strong password longer than 6 characters";
            changeAttempt(result);
        }
        else {
            var user = {
                username: username,
                password: password
            };
            fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user),
            })
                .then(function (res) {
                if (res.status == 200) {
                    changeLoginStatus(true);
                    changeUser(username);
                }
            })
                .catch(function (err) { return console.log(err); });
        }
    };
    if (loginStatus === false) {
        return (React.createElement("div", null,
            React.createElement(LoginPage_1.default, { loginButton: loginButton, signUp: signUp, loginAttempt: loginAttempt })));
    }
    //else if logged in, take to the main page
    return (React.createElement("div", null, "hello"));
};
exports.default = App;
