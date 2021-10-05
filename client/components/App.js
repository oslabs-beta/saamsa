"use strict";
exports.__esModule = true;
var React = require("react");
var LoginPage_1 = require("./LoginPage");
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
                body: JSON.stringify(user)
            })
                .then((function (res) { return res.json(); }))["catch"](function (err) { return changeAttempt('Incorrect Username or password'); });
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
                body: JSON.stringify(user)
            })
                .then(function (res) {
                if (res.status == 200) {
                    changeLoginStatus(true);
                    changeUser(username);
                }
            })["catch"](function (err) { return console.log(err); });
        }
    };
    if (loginStatus === false) {
        return (React.createElement("div", null,
            React.createElement(LoginPage_1["default"], { loginButton: loginButton, signUp: signUp, loginAttempt: loginAttempt })));
    }
    //else if logged in, take to the main page
    return (React.createElement("div", null, "hello"));
};
exports["default"] = App;
