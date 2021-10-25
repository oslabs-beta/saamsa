import * as React from 'react';
import * as d3 from 'd3';
import { select as d3Select } from 'd3-selection';
import { transition as d3Transition } from 'd3-transition';
import axios from 'axios';
import '../../client/scss/Graph.scss';
import { Event } from 'electron';

d3Select.prototype.transition = d3Transition;
interface Props {
  topic: string;
  xScale: null | d3.ScaleLinear<number, number, never>;
  setXScale: (arg: () => d3.ScaleLinear<number, number, never>) => void;
  data: Array<{ time: number; value: number }>;
  consumerList: any;
  bootstrap: string;
  topicList: string[];
}
const Graph = ({
  bootstrap,
  data,
  xScale,
  topicList,
  setXScale,
  topic,
  consumerList,
}: Props): JSX.Element => {
  //below always remove old graph on render/re-render
  d3.select('svg').remove();
  console.log(xScale?.range());
  //if there is data, we actually make the graph
  if (data.length && xScale) {
    const dataTimeMax: number = data.reduce((acc, val) => {
      //checking if value is null -> means partition does not exist
      if (val.value !== null && val.time > acc.time) return val;
      else return acc;
    }).time;
    const dataValueMax: number = data.reduce((acc, val) => {
      if (val.value > acc.value) return val;
      else return acc;
    }).value;
    const margin: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    } = {
      top: 40,
      bottom: 40,
      left: 40,
      right: 40,
    };
    const height = 600 - margin.top - margin.bottom;
    const width = 600 - margin.left - margin.right;
    //calculating min and max for x-axis and y-axis, used to adjust the range of the axes

    //defining the limits for the binning function (each partition should have its own group)
    const newArr: number[] = [];
    for (let i = 0; i <= dataTimeMax; i++) {
      newArr.push(i);
    }
    const barWidth =
      (xScale.range()[1] - xScale.range()[0]) / (dataTimeMax + 1);
    //transforming data from backend to be in correct form (frequency array)
    const newData: number[] = [];
    data.forEach((el) => {
      for (let i = 0; i < el.value; i++) {
        newData.push(el.time);
      }
    });

    //grabbing container to hold graph and axes, then appending a smaller g to hold only graph
    d3.select('#mainContainer')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    //zoom function which grabs the new length of window, then resizes bars and x-axis
    const zoom = (
      arg: d3.Selection<Element, unknown, HTMLElement, unknown>
    ): void => {
      const extent: [[number, number], [number, number]] = [
        [margin.left, margin.top], //new min width and min height after zoom
        [width - margin.right, height - margin.top], //new max width and height after zoom
      ];
      const zoomed = (event: d3.D3ZoomEvent<any, number>) => {
        xScale!.range(
          [margin.left, width - margin.right].map((d) =>
            event.transform.applyX(d)
          )
        );

        const newBarWidth =
          (Math.abs(xScale!.range()[1] - xScale!.range()[0]) / width) *
          barWidth;

        arg
          .selectAll('.bar')
          .attr('width', newBarWidth)
          .attr('transform', (d: any): string => {
            //updating x-y coords for each bar
            return `translate(${
              d.x0! * newBarWidth + margin.left + xScale!.range()[0]
            } ,${yScale(d.length)})`;
          });
        d3.select<any, any>('.xAxis').call(d3.axisBottom(xScale!)); //resetting x-axis to use new range
      };
      //actually applying the d3.zoom event onto the passed in element
      arg.call(
        d3
          .zoom()
          .scaleExtent([1, 8]) //i'm pretty sure this is just granularity of the zoom
          .translateExtent(extent)
          .extent(extent)
          .on('zoom', zoomed) //on zoom event, invoke above zoomed function
      );
    };
    const svg: d3.Selection<Element, unknown, HTMLElement, unknown> =
      d3.select('g');
    //appending zoom feature onto the svg
    svg.call(zoom);
    //calculating x-y scales
    // const newXScale = d3
    //   .scaleLinear()
    //   .domain([-0.5, dataTimeMax + 0.5]) //need to have +- 0.5 on each half because the partition is centered on each bar
    //   .range([0, width]);
    // setXScale(newXScale);

    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(dataValueMax * 1.2)]) //this is just so the bar doesn't hit the very top of the graph, just for looks
      .range([height, 0]);
    //creating the binning function that will group the data into bins according to the newArr(e.g. [0,1,2,3,4]) thresholds
    const histogram = d3
      .bin()
      .value((d) => d)
      .thresholds(newArr);
    //creating the actual bins and then filtering out any undefined returns
    let bars = histogram(newData);
    bars = bars.filter((el) => el.x0 !== undefined);
    //appending a clip path so when we zoom graph doesn't go past the left and right margins
    svg
      .append('defs')
      .append('svg:clipPath')
      .attr('id', 'clip')
      .append('svg:rect')
      .attr('width', width)
      .attr('height', height + 10)
      .attr('x', margin.left)
      .attr('y', margin.top);
    //making sure that x-axis and y-axis ticks are integers only!
    const xAxisTicks = xScale!
      .ticks()
      .filter((tick: any) => Number.isInteger(tick));

    const xAxis = d3
      .axisBottom(xScale!)
      .tickValues(xAxisTicks)
      .tickFormat(d3.format('d'));

    const yAxisTicks = yScale.ticks().filter((tick) => Number.isInteger(tick));
    const yAxis = d3
      .axisLeft(yScale)
      .tickValues(yAxisTicks)
      .tickFormat(d3.format('d'));
    //appending the bars and x-axis to a new g element which is clippable and references the clip path above so that these two things that are the only thing clipped
    svg
      .append('g')
      .attr('class', 'clippable')
      .attr('clip-path', 'url(#clip)')
      .selectAll('rect')
      .data(bars)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => d.x0!)
      .attr('transform', function (d) {
        return (
          'translate(' +
          (d.x0! * barWidth + xScale.range()[0] + margin.left) + //calculating x-offset
          ',' +
          yScale(d.length) + //calculating y-offset (starts from top!`)
          ')'
        );
      })
      .attr('width', `${barWidth - 1}`)
      .attr('height', function (d) {
        return height - yScale(d.length);
      })
      .style('fill', '#69b3a2');

    svg.selectAll('.bar').exit().remove();
    svg.select('.xAxis').exit().remove();
    svg.select('.yAxis').exit().remove();
    d3.select('.clippable')
      .append('g')
      .call(xAxis)
      .attr('class', 'xAxis')
      .attr('transform', `translate(${xScale.range()[0]},${height})`)
      //adding label
      .append('text')
      .attr('class', 'axis-label')
      .text('Partition Index')
      .attr('x', width - 140)
      .attr('y', 25); // Relative to the x axis.
    //appending y-axis directly to graph, cause we don't want it to be clipped
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
    //adding an invisible rectangle to svg so that anywhere within graph area you can zoom, as zoom only works on filled elements
    svg
      .append('rect')
      .attr('width', width)
      .attr('height', height)
      .attr('fill', '#fff')
      .attr('opacity', 0);
  }

  // nodes: {id: string, group: numorString}
  // links: {source: string, target: string, value: num}
  //loop through topics, and create a node for each topic
  //loop through consumer groups and create a node for each consumer group
  //loop through conusmer and create a node for each consumer
  //loop through consumer groups and create link for all consumers in that group
  //loop through consumers and create a node for each topics subscribed to
  const colorDict: { [key: string]: string } = {
    broker: 'red',
    consumer: 'blue',
    consumerGroup: 'green',
    topic: 'yellow',
  };
  const nodes: any = [];
  const links: any = [];
  console.log(consumerList);
  if (bootstrap.length) nodes.push({ id: bootstrap, group: 'broker' });
  if (topicList.length && consumerList.length) {
    topicList.forEach((el) => {
      nodes.push({ id: el, group: 'topic' });
      links.push({ source: el, target: bootstrap, value: 10 });
    });
    consumerList.forEach(
      (el2: {
        groups: [
          {
            groupId: string;
            members: [
              {
                clientId: string;
                memberId: string;
                stringifiedMetadata: string;
              }
            ];
          }
        ];
      }) => {
        el2.groups.forEach((innerEl) => {
          if (innerEl.members.length)
            nodes.push({ id: innerEl.groupId, group: 'consumerGroup' });
          innerEl.members.forEach((innerInnerEl) => {
            nodes.push({ id: innerInnerEl.memberId, group: 'consumer' });
            links.push({
              source: innerEl.groupId,
              target: innerInnerEl.memberId,
              value: 10,
            });
            links.push({
              source: innerInnerEl.memberId,
              target: innerInnerEl.stringifiedMetadata,
              value: 4,
            });
          });
        });
      }
    );
  }
  console.log(nodes);
  console.log(links);
  const chart = () => {
    const svg = d3.select('svg');
    const width = 480;
    const height = 480;
    const simulation = d3
      .forceSimulation<typeof nodes>(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      // .attr('stroke-width', (d) => Math.sqrt(d.value));
      .attr('stroke-width', 2);

    const node = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', 5)
      .attr('fill', (d: any) => {
        // const color = JSON.stringify(d.group);

        console.log(colorDict[d.group]);
        return colorDict[d.group];
      });
    // .call(drag(simulation));

    node.append('title').text((d: any) => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);

      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });

    // invalidation.then(() => simulation.stop());

    return svg.node();
  };

  const drag = (simulation: any) => {
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }

    return d3
      .drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };
  chart();
  // }
  // const rects = d3.selectAll('.bar').data(data);
  // rects.enter().append('rect').attr('class', 'bar');
  // rects.attr('height', function (d) {
  //   return 520 - yScale(d.length);
  // }));
  // React.useEffect(() => {
  //   console.log('updating xScale');
  //   const newXScale = d3
  //     .scaleLinear()
  //     .range([0, 520])
  //     .domain([-0.5, data.length + 0.5]);
  //   console.log(newXScale.range());
  //   setXScale(() => newXScale);
  // }, [topic]);

  return <div id='mainContainer'>{!!data.length && <h2>Graph</h2>}</div>;
};

export default Graph;

//old stuff
//creating the function that will take in the data and produce the path element
// const line = d3
//   .line<typeof data[0]>()
//   .defined((d) => d.value !== null)
//   .curve(d3.curveBasis)
//   .x((d) => xScale(d.time))
//   .y((d) => yScale(d.value));
// .data(data)
// .attr('transform', `translate(${margin.left}, ${margin.bottom})`)
// .attr('fill', 'none')
// .attr('stroke', '#000')
// .attr('stroke-width', '2px')
// .attr('class', 'line');
// .attr('d', line(data));
//defining the xaxis from the scales
//this is for brush instead of zoom, as an alternate approach, doesn't work, and a little bit more finnicky
// const updateChart = (event: d3.D3BrushEvent<number[]>): void => {
//   if (event.selection) {
//     const extent = event.selection;
//     xScale.domain([
//       xScale.invert(
//         typeof extent[0] === 'number' ? extent[0] : extent[0][0]
//       ),
//       xScale.invert(
//         typeof extent[1] === 'number' ? extent[1] : extent[1][1]
//       ),
//     ]);
//     const newRange = xScale.domain()[1] - xScale.domain()[0];
//     const newBarWidth = width / newRange;
//     d3.select<any, any>('.brush').call(brush.move, null);
//     d3.select<any, any>('.xAxis')
//       .transition()
//       .duration(1000)
//       .call(d3.axisBottom(xScale));
//     svg
//       .selectAll('rect')
//       .transition()
//       .duration(1000)
//       .attr('transform', function (d) {
//         return (
//           'translate(' +
//           (d.x0! * newBarWidth + margin.left) +
//           ',' +
//           yScale(d.length) +
//           ')'
//         );
//       })
//       .attr('width', newBarWidth);
//   }
// };
// const brush = d3
//   .brushX()
//   .extent([
//     [0, 0],
//     [width, height + 20],
//   ])
//   .on('end', updateChart);
// svg
//   .append('g')
//   .attr('class', 'brush')
//   .call(brush)
//   .attr('transform', `translate(${margin.left}, ${margin.top})`);
