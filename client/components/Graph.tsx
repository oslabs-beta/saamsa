import * as React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
import '../../client/scss/Graph.scss';
interface Props {
  data: Array<{ time: number; value: number }>;
}
const Graph = ({ data }: Props): JSX.Element => {
  //below always remove old graph on render/re-render
  d3.select('svg').remove();
  //if there is data, we actually make the graph
  if (data.length) {
    const margin: { top: number; bottom: number; left: number; right: number } =
      {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      };
    const height = 600 - margin.top - margin.bottom;
    const width = 600 - margin.left - margin.right;
    //calculating min and max for x-axis and y-axis, used to adjust the range of the axes
    const dataTimeMin: number = data.reduce((acc, val) => {
      if (val.time < acc.time) return val;
      else return acc;
    }).time;
    const dataTimeMax: number = data.reduce((acc, val) => {
      //checking if value is null -> means partition does not exist
      if (val.value !== null && val.time > acc.time) return val;
      else return acc;
    }).time;
    const dataValueMin: number = data.reduce((acc, val) => {
      if (val.value < acc.value) return val;
      else return acc;
    }).value;
    const dataValueMax: number = data.reduce((acc, val) => {
      if (val.value > acc.value) return val;
      else return acc;
    }).value;
    const newArr = [];
    for (let i = 0; i <= dataTimeMax; i++) {
      newArr.push(i);
    }
    console.log(newArr);
    const barWidth = width / (dataTimeMax + 1.2) - 1;
    const newData: number[] = [];
    data.forEach((el) => {
      for (let i = 0; i < el.value; i++) {
        newData.push(el.time);
      }
    });
    //adding svg to the mainContainer, currently blank

    d3.select('#mainContainer')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    const svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> =
      d3.select('g');
    //calculating the x-scale and y-scale functions
    const xScale = d3
      .scaleLinear()
      .domain([dataTimeMin, dataTimeMax + 1.2])
      .range([0, width]);
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(dataValueMax * 1.2)])
      .range([height, 0]);
    //creating the function that will take in the data and produce the path element
    // const line = d3
    //   .line<typeof data[0]>()
    //   .defined((d) => d.value !== null)
    //   .curve(d3.curveBasis)
    //   .x((d) => xScale(d.time))
    //   .y((d) => yScale(d.value));
    const histogram = d3
      .bin()
      .value((d) => d)
      .thresholds(newArr);
    const bars = histogram(newData);
    console.log(bars);
    //putting the data into svg and moving it around according to the margin
    svg
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .selectAll('rect')
      .data(bars)
      .enter()
      .append('rect')
      .attr('x', 1)
      .attr('transform', function (d) {
        return (
          'translate(' +
          (xScale(d.x0!) + margin.left) +
          ',' +
          yScale(d.length) +
          ')'
        );
      })
      .attr('width', `${barWidth}`)
      .attr('height', function (d) {
        return height - yScale(d.length);
      })
      .style('fill', '#69b3a2');

    // .data(data)
    // .attr('transform', `translate(${margin.left}, ${margin.bottom})`)
    // .attr('fill', 'none')
    // .attr('stroke', '#000')
    // .attr('stroke-width', '2px')
    // .attr('class', 'line');
    // .attr('d', line(data));
    //defining the xaxis from the scales
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    //appending the axes to the svg
    svg
      .append('g')
      .call(xAxis)
      .attr('class', 'xAxis')
      .attr('transform', `translate(${margin.left + barWidth / 2},${height})`)
      //adding label
      .append('text')
      .attr('class', 'axis-label')
      .text('Partition Index')
      .attr('x', width - 140)
      .attr('y', 25); // Relative to the x axis.
    svg
      .append('g')
      .attr('class', 'yAxis')
      .attr('transform', `translate(${margin.left},0)`)
      .call(yAxis)
      //adding label
      .append('text')
      .attr('class', 'axis-label')
      .text('Offsets for each partition')
      .attr('transform', 'rotate(-90)')
      .attr('x', -75)
      .attr('y', -25); // Relative to the y axis.
  }
  return <div id='mainContainer'>{!!data.length && <h2>Graph</h2>}</div>;
};

export default Graph;
