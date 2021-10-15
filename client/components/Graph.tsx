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
    const height = 600;
    const width = 600;
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
    //adding svg to the mainContainer, currently blank
    const svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> = d3
      .select('#mainContainer')
      .append('svg');
    //calculating the x-scale and y-scale functions
    const xScale = d3
      .scaleLinear()
      .domain([dataTimeMin, dataTimeMax])
      .range([0, width - margin.left - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain([dataValueMax, dataValueMin])
      .range([0, height - margin.top - margin.bottom]);
    //creating the function that will take in the data and produce the path element
    const histogram = d3
      .line<typeof data[0]>()
      .value((d) => d)
      .domain([dataTimeMin, dataTimeMax])
      .thresholds(xScale.ticks(70));
    const bins = histogram(data.map((el) => el.value));
    //putting the data into svg and moving it around according to the margin
    svg.attr('width', width).attr('height', height);

    //defining the xaxis from the scales
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    //appending the axes to the svg
    svg
      .append('g')
      .call(xAxis)
      .attr('class', 'xAxis')
      .attr('transform', `translate(${margin.left},${height - margin.bottom})`)
      //adding label
      .append('text')
      .attr('class', 'axis-label')
      .text('Number of partitions')
      .attr('x', width - 140)
      .attr('y', 25); // Relative to the x axis.
    svg
      .append('g')
      .attr('class', 'yAxis')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis)
      //adding label
      .append('text')
      .attr('class', 'axis-label')
      .text('Offsets for each partition')
      .attr('transform', 'rotate(-90)')
      .attr('x', -75)
      .attr('y', -25); // Relative to the y axis.

    svg
      .selectAll('rect')
      .data(bins)
      .enter()
      .append('rect')
      .attr('x', 1)
      .attr('transform', function (d) {
        return 'translate(' + xScale(d.x0!) + ',' + yScale(d.length) + ')';
      })
      .attr('width', function (d) {
        return xScale(d.x1!) - xScale(d.x0) - 1;
      })
      .attr('height', function (d) {
        return height - yScale(d.length);
      })
      .style('fill', '#69b3a2');
  }
  return (
    <div>
      {!!data.length && <h2>Graph</h2>}
      <div id='mainContainer'></div>
    </div>
  );
};

export default Graph;
