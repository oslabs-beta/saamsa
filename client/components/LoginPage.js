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
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/no-empty-function */
var React = __importStar(require("react"));
require("../scss/LoginPage.scss");
var LoginPage = function (_a) {
    var 
    // loginStatus, 
    // changeLoginStatus, 
    loginAttempt = _a.loginAttempt, 
    // changeAttempt, 
    loginButton = _a.loginButton, signUp = _a.signUp;
    return (React.createElement("div", { className: "loginWrapper" },
        React.createElement("div", { className: "loginTitle" },
            React.createElement("h1", { className: "heading" }, "Saamsa")),
        React.createElement("div", { id: "usernameAndPasswordWrapper" },
            React.createElement("input", { name: "username", placeholder: "username", id: "username", autoComplete: "off" }),
            React.createElement("input", { name: "password", placeholder: "password", id: "password", autoComplete: "off", type: "password" })),
        React.createElement("div", { id: "buttonsDiv" },
            React.createElement("button", { type: "button", id: "loginBtn", onClick: loginButton, value: "Log-In" }, "Log In"),
            React.createElement("button", { id: "forgotPassword" }, " Forgot password? "),
            React.createElement("div", { id: "loginAttemptMessage" }, loginAttempt)),
        React.createElement("div", { id: "signUpArea" },
            React.createElement("h2", { id: "noAccount" }, "Don't have an account? "),
            React.createElement("button", { type: "button", onClick: signUp, id: "signUpBtn", value: "Sign-Up" }, "Sign up"))));
};
exports.default = LoginPage;
