import * as React from 'react';
import * as d3 from 'd3';
import axios from 'axios';
interface Props {
  data: { time: number; value: number }[];
  setData: ([{ time, value }]: { time: number; value: number }[]) => void;
  bootstrap: string;
  setBootstrap: (str: string) => void;
  topic: string;
  setTopic: (str: string) => void;
  loginStatus: boolean;
}
const Graph = ({
  setData,
  data,
  loginStatus,
  setBootstrap,
  setTopic,
  topic,
  bootstrap,
}: Props): JSX.Element => {
  const changeParams = () => {
    const bootstrap: HTMLInputElement =
      document.querySelector('#bootstrapInput')!;
    const topic: HTMLInputElement = document.querySelector('#topicInput')!;
    setBootstrap(bootstrap.value);
    setTopic(topic.value);
  };
  const connectAndInterval = () => {
    if (document.querySelector('#mainContainer')!.className) {
      clearInterval(
        Number(document.querySelector('#mainContainer')!.className)
      );
    }
    if (bootstrap.length && topic.length) {
      axios({
        method: 'POST',
        url: 'http://localhost:3001/kafka',
        data: { bootstrap, topic },
      })
        // .then((response) => {
        //   setData(response.data);
        // })
        .then(() => {
          const intervalId = window.setInterval(() => {
            axios({
              method: 'GET',
              url: 'http://localhost:3001/kafka/refresh',
            })
              .then((response) => {
                d3.select('svg').remove();
                return response;
              })
              .then((response) => {
                setData(response.data);
              });
          }, 3000);
          d3.select('#mainContainer').attr('class', `${intervalId}`);
        });
    }
  };

  const clearInterval = (num: number) => {
    window.clearInterval(num);
  };

  const margin: { top: number; bottom: number; left: number; right: number } = {
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
  d3.select('svg').remove();
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
    .curve(d3.curveBasis)
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
  React.useEffect(() => setData([{ value: 0, time: 0 }]), []);
  if (loginStatus) {
    return (
      <div>
        <h2>Graph</h2>
        <button onClick={connectAndInterval}>Connect to Kafka</button>
        <button
          onClick={() =>
            clearInterval(
              Number(document.querySelector('#mainContainer')?.className)
            )
          }
        >
          Disconnect From Kafka
        </button>
        <label htmlFor='bootstrapInput'>Bootstrap Server Location:</label>
        <input id='bootstrapInput' type='text'></input>
        <label htmlFor='topicInput'>Topic Name:</label>
        <input id='topicInput' type='text'></input>
        <button onClick={changeParams}>Submit</button>
      </div>
    );
  } else {
    return <div></div>;
  }
};

export default Graph;
