"use strict";
exports.__esModule = true;
var React = require("react");
var Graph_1 = require("./Graph");
var App = function () {
    var _a = React.useState([
        { time: 0, value: 10 },
        { time: 1, value: 50 },
        { time: 2, value: 250 },
        { time: 3, value: 1250 },
        { time: 4, value: 6250 },
    ]), data = _a[0], setData = _a[1];
    return (React.createElement("div", { id: 'mainContainer' },
        React.createElement(Graph_1["default"], { data: data, setData: setData })));
};
exports["default"] = App;
