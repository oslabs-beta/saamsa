import * as React from 'react';
import * as d3 from 'd3';
interface Props {
  data: Array<{ time: number; value: number }>;
  // setData: ([{ time, value }]: { time: number; value: number }[]) => void;
  // not used currently but might use later
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

const Holder = ({ data, setIsLoggedIn, isLoggedIn }: Props): JSX.Element => {
  if (isLoggedIn) {
    const margin: { top: number; bottom: number; left: number; right: number } =
      {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      };
    const height = 200;
    const width = 200;
    const dataTimeMin: number = data.reduce((acc, val) => {
      if (val.time < acc.time) return val;
      else return acc;
    }).time;
    const dataTimeMax: number = data.reduce((acc, val) => {
      if (val.time > acc.time) return val;
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
    const svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, any> = d3
      .select('#mainContainer')
      .append('svg');
    const xScale = d3
      .scaleLinear()
      .domain([dataTimeMin, dataTimeMax])
      .range([0, width - margin.left - margin.right]);
    const yScale = d3
      .scaleLinear()
      .domain([dataValueMax, dataValueMin])
      .range([0, height - margin.top - margin.bottom]);
    const line = d3
      .line<any>()
      .defined((d) => d.value !== null)
      .curve(d3.curveCatmullRom.alpha(0.04))
      .x((d) => xScale(d.time))
      .y((d) => yScale(d.value));
    svg
      .attr('width', width)
      .attr('height', height)
      .append('path')
      .data(data)
      .attr('transform', `translate(${margin.left}, ${margin.bottom})`)
      .attr('fill', 'none')
      .attr('stroke', '#ccc')
      .attr('class', 'line')
      .attr('d', line(data));
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    svg
      .append('g')
      .call(xAxis)
      .attr('class', 'xAxis')
      .attr('transform', `translate(${margin.left},${height - margin.bottom})`);
    svg
      .append('g')
      .attr('class', 'yAxis')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .call(yAxis);
  } else {
    d3.select('svg').remove();
  }
  return (
    <div>
      <h2>Graph</h2>
      <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
        Press me to login :&#41;
      </button>
    </div>
  );
};

export default Holder;
