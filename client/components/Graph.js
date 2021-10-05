"use strict";
exports.__esModule = true;
var React = require("react");
var d3 = require("d3");
var Holder = function (_a) {
    var data = _a.data, setData = _a.setData;
    var dataTimeMin = data.reduce(function (acc, val) {
        if (val.time < acc.time)
            return val;
        else
            return acc;
    }).time;
    var dataTimeMax = data.reduce(function (acc, val) {
        if (val.time > acc.time)
            return val;
        else
            return acc;
    }).time;
    var dataValueMin = data.reduce(function (acc, val) {
        if (val.value < acc.value)
            return val;
        else
            return acc;
    }).value;
    var dataValueMax = data.reduce(function (acc, val) {
        if (val.value > acc.value)
            return val;
        else
            return acc;
    }).value;
    var svg = d3
        .select('#mainContainer')
        .append('svg');
    var xScale = d3
        .scaleLinear()
        .domain([dataTimeMin, dataTimeMax])
        .range([0, 200]);
    var yScale = d3
        .scaleLinear()
        .domain([dataValueMin, dataValueMax])
        .range([0, 100]);
    var line = d3
        .line()
        .defined(function (d) { return d[0] !== null; })
        .curve(d3.curveCatmullRom.alpha(0.04))
        .x(function (d) { return xScale(d[0]); })
        .y(function (d) { return yScale(d[1]); });
    svg
        .append('path')
        .data(data)
        .attr('transform', 'translate(40,40)')
        .attr('fill', 'none')
        .attr('stroke', '#ccc')
        .attr('class', 'line')
        .attr('d', line(data));
    return (React.createElement("div", null,
        React.createElement("h2", null,
            "Counter: ",
            data),
        React.createElement("button", { onClick: function () { return setData([{ time: 0, value: 1000 }]); } }, "Press Me :)")));
};
exports["default"] = Holder;
