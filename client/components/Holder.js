"use strict";
exports.__esModule = true;
var React = require("react");
var Holder = function (_a) {
    var count = _a.count, setCount = _a.setCount;
    return (React.createElement("div", null,
        React.createElement("h2", null,
            "Counter: ",
            count),
        React.createElement("button", { onClick: function () { return setCount(count + 1); } }, "Press Me :)")));
};
exports["default"] = Holder;
