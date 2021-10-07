import * as React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
interface Props {
  data: Array<{ time: number; value: number }>;
  setData: ([{ time, value }]: { time: number; value: number }[]) => void;
  loginStatus: boolean;
}
const Graph = ({ setData, data, loginStatus }: Props): JSX.Element => {
  const connectAndInterval = () => {
    axios({
      method: 'GET',
      url: 'http://localhost:3000/kafka',
    })
      .then((response) => {
        setData(response.data);
      })
      .then(() => {
        const intervalId = window.setInterval(() => {
          axios({
            method: 'GET',
            url: 'http://localhost:3000/kafka/refresh',
          })
            .then((response) => {
              d3.select('svg').remove();
              return response;
            })
            .then((response) => {
              setData(response.data);
            });
        }, 6000);
        d3.select('#mainContainer').attr('class', `${intervalId}`);
      });
  };

  const clearInterval = (num: number) => {
    window.clearInterval(num);
  };
  if (loginStatus) {
    const margin: { top: number; bottom: number; left: number; right: number } =
      {
        top: 40,
        bottom: 40,
        left: 40,
        right: 40,
      };
    const height = 600;
    const width = 600;
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
    const svg: d3.Selection<SVGSVGElement, unknown, HTMLElement, unknown> = d3
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
      .line<typeof data[0]>()
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
  }
  return (
    <div>
      <h2>Graph</h2>
      <button id='connectButton' onClick={connectAndInterval}>
        Connect to Kafka
      </button>
      <button
        id='disconnectButton'
        onClick={() =>
          clearInterval(
            Number(document.querySelector('#mainContainer')!.className)
          )
        }
      >
        Disconnect From Kafka
      </button>
    </div>
  );
};

export default Graph;
