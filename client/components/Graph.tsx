import * as React from 'react';
import * as d3 from 'd3';
import '../../client/scss/Graph.scss';
import axios from 'axios';
import * as _ from 'lodash';
interface Props {
  setData: (arg: any) => void;
  topic: string;
  yScale: d3.ScaleLinear<number, number, never>;
  setYScale: (arg: () => d3.ScaleLinear<number, number, never>) => void;
  xScale: d3.ScaleLinear<number, number, never>;
  setXScale: (arg: () => d3.ScaleLinear<number, number, never>) => void;
  data: Array<{ time: number; value: number }>;
  consumerList: any;
  bootstrap: string;
  topicList: string[];
  setTopic: (arg: any) => void;
}
const Graph = ({
  setData,
  bootstrap,
  data,
  xScale,
  topicList,
  setXScale,
  // yScale,
  // setYScale,
  topic,
  consumerList,
  setTopic,
}: Props): JSX.Element => {
  //below always remove old graph on render/re-render
  // d3.select('svg').remove();
  // d3.select('svg').remove();
  console.log(xScale?.range());
  //if there is data, we actually make the graph

  const renderGraph = () => {
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
    // const calculateYScale = () => {
    //   const dataValueMax: number = data.reduce(
    //     (acc, val) => {
    //       if (val.value > acc.value) return val;
    //       else return acc;
    //     },
    //     { value: 0 }
    //   ).value;
    //   const newYScale = d3
    //     .scaleLinear()
    //     .domain([0, Math.ceil(dataValueMax * 1.2)]) //this is just so the bar doesn't hit the very top of the graph, just for looks
    //     .range([height, 0]);
    //   setYScale(() => newYScale);
    //   // d3.select('.yAxis').call()
    //   const yAxisTicks = newYScale
    //     .ticks()
    //     .filter((tick) => Number.isInteger(tick));
    //   d3.select<any, any>('.yAxis').call(
    //     d3.axisLeft(newYScale).tickValues(yAxisTicks).tickFormat(d3.format('d'))
    //   );
    //   console.log(yScale?.range());
    // };
    const dataTimeMax: number = data.reduce(
      (acc, val) => {
        //checking if value is null -> means partition does not exist
        if (val.value !== null && val.time > acc.time) return val;
        else return acc;
      },
      { time: 0 }
    ).time;
    const dataValueMax: number = data.reduce(
      (acc, val) => {
        if (val.value > acc.value) return val;
        else return acc;
      },
      { value: 0 }
    ).value;

    //defining the limits for the binning function (each partition should have its own group)
    const newArr: number[] = [];
    for (let i = 0; i <= dataTimeMax; i++) {
      newArr.push(i);
    }
    const barWidth = width / (dataTimeMax + 1) - 1;
    if (data.length) {
      console.log('rendering graph');
      d3.select('.xAxis').remove();
      d3.select('.yAxis').remove();
      d3.select('text').remove();
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
          // const newDataValueMax: number = data.reduce(
          //   (acc, val) => {
          //     if (val.value > acc.value) return val;
          //     else return acc;
          //   },
          //   { value: 0 }
          // ).value;
          xScale.range([0, width].map((d) => event.transform.applyX(d)));
          // const newYScale = d3
          //   .scaleLinear()
          //   .domain([0, Math.ceil(newDataValueMax * 1.2)]) //this is just so the bar doesn't hit the very top of the graph, just for looks
          //   .range([height, 0]);
          const newBarWidth =
            (Math.abs(xScale.range()[1] - xScale.range()[0]) / width) *
            barWidth;

          arg
            .selectAll('.bar')
            .attr('width', newBarWidth)
            .attr('transform', (d: any): string => {
              //updating x-y coords for each bar
              return `translate(${xScale(d!.x0)} ,${yScale(d.length)})`;
            })
            .attr('height', (d: any) => `${height - yScale(d.length) - 2}`);
          d3.select<any, any>('.xAxis').call(
            d3
              .axisBottom(xScale)
              .tickValues(xAxisTicks)
              .tickFormat(d3.format('d'))
          ); //resetting x-axis to use new range
          setXScale(() => xScale);
          // d3.select<any, any>('.yAxis').call(
          //   d3
          //     .axisLeft(newYScale)
          //     .tickValues(yAxisTicks)
          //     .tickFormat(d3.format('d'))
          // );
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
      const xScale = d3
        .scaleLinear()
        .domain([-0.5, dataTimeMax + 0.5]) //need to have +- 0.5 on each half because the partition is centered on each bar
        .range([0, width]);
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
      const xAxisTicks = xScale
        .ticks()
        .filter((tick) => Number.isInteger(tick));
      const xAxis = d3
        .axisBottom(xScale)
        .tickValues(xAxisTicks)
        .tickFormat(d3.format('d'));
      const yAxisTicks = yScale
        .ticks()
        .filter((tick) => Number.isInteger(tick));
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
        .join('rect')
        .attr('class', 'bar')
        .attr('x', (d) => d.x0!)
        .attr('transform', function (d) {
          return (
            'translate(' +
            (d.x0! * barWidth + margin.left) + //calculating x-offset
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
      d3.select('.clippable')
        .append('g')
        .call(xAxis)
        .attr('class', 'xAxis')
        .attr('transform', `translate(${margin.left},${height})`)
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
  };
  // nodes: {id: string, group: numorString}
  // links: {source: string, target: string, value: num}
  //loop through topics, and create a node for each topic
  //loop through consumer groups and create a node for each consumer group
  //loop through conusmer and create a node for each consumer
  //loop through consumer groups and create link for all consumers in that group
  //loop through consumers and create a node for each topics subscribed to
  const chart = () => {
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
    d3.select('#mainContainer')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
    const colorDict: { [key: string]: string } = {
      broker: 'red',
      consumer: 'blue',
      consumerGroup: 'green',
      topic: 'yellow',
    };
    const nodes: any = [];
    console.log('topic list is', topicList);
    const links: any = [];
    if (bootstrap.length) nodes.push({ id: bootstrap, group: 'broker' });
    if (topicList.length) {
      topicList.forEach((el) => {
        nodes.push({ id: el, group: 'topic' });
        links.push({ source: el, target: bootstrap, value: 10 });
      });
    }
    if (consumerList && consumerList.length) {
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
            if (innerEl.members.length) {
              if (
                !nodes.some(
                  (el: { id: string }) => el.id === 'saamsaLoadBalancer'
                )
              )
                nodes.push({ id: innerEl.groupId, group: 'consumerGroup' });
              innerEl.members.forEach((innerInnerEl) => {
                nodes.push({ id: innerInnerEl.memberId, group: 'consumer' });
                links.push({
                  source: innerEl.groupId,
                  target: innerInnerEl.memberId,
                  value: 10,
                });
                if (
                  innerInnerEl &&
                  innerInnerEl.stringifiedMetadata.length &&
                  innerInnerEl.stringifiedMetadata !== 'topic_not_found'
                ) {
                  links.push({
                    source: innerInnerEl.memberId,
                    target: innerInnerEl.stringifiedMetadata,
                    value: 4,
                  });
                } else {
                  console.log('topic_not_found');
                }
              });
            }
          });
        }
      );
    }
    console.log(topicList);
    console.log(nodes);
    console.log(links);
    const svg = d3.select('svg');

    const simulation = d3
      .forceSimulation(nodes)
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
      .attr('stroke-width', (d: any) => Math.sqrt(d.value))
      .attr('stroke-width', 2);

    const node: any = svg
      .append('g')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('class', (d: any) => d.group)
      .attr('r', 5)
      .attr('fill', (d: any) => {
        return colorDict[d.group];
      })
      .call(drag(simulation));
    d3.selectAll('.topic').on('click', (event) => {
      const selectedText = event.target.childNodes[0].innerHTML;
      if (bootstrap.length && selectedText) {
        //making initial request so we instantly update the data
        axios({
          method: 'POST',
          url: '/kafka/refresh',
          data: { topic: selectedText, bootstrap },
        })
          .then((response: { data: [{ value: number; time: number }] }) => {
            return response;
          })
          .then((response) => {
            console.log(
              topic,
              selectedText,
              'alksdjflkajsflkjasflaksjdflkajsf'
            );
            if (!_.isEqual(response.data, data)) {
              d3.selectAll('.bar').remove();
              setData(response.data);
              setTopic(selectedText);
            } //checking if user selected blank topic (if so, graph should disappear)
          });
      }
    });
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
      .drag<any, any>()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended);
  };

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
  const updateGraph = () => {
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
    // const width = 600 - margin.left - margin.right;
    //calculating min and max for x-axis and y-axis, used to adjust the range of the axes
    // const calculateYScale = () => {
    //   const dataValueMax: number = data.reduce(
    //     (acc, val) => {
    //       if (val.value > acc.value) return val;
    //       else return acc;
    //     },
    //     { value: 0 }
    //   ).value;
    //   const newYScale = d3
    //     .scaleLinear()
    //     .domain([0, Math.ceil(dataValueMax * 1.2)]) //this is just so the bar doesn't hit the very top of the graph, just for looks
    //     .range([height, 0]);
    //   setYScale(() => newYScale);
    //   // d3.select('.yAxis').call()
    //   const yAxisTicks = newYScale
    //     .ticks()
    //     .filter((tick) => Number.isInteger(tick));
    //   d3.select<any, any>('.yAxis').call(
    //     d3.axisLeft(newYScale).tickValues(yAxisTicks).tickFormat(d3.format('d'))
    //   );
    //   console.log(yScale?.range());
    // };
    const dataTimeMax: number = data.reduce(
      (acc, val) => {
        //checking if value is null -> means partition does not exist
        if (val.value !== null && val.time > acc.time) return val;
        else return acc;
      },
      { time: 0 }
    ).time;
    const dataValueMax: number = data.reduce(
      (acc, val) => {
        if (val.value > acc.value) return val;
        else return acc;
      },
      { value: 0 }
    ).value;

    //defining the limits for the binning function (each partition should have its own group)
    const newArr: number[] = [];
    for (let i = 0; i <= dataTimeMax; i++) {
      newArr.push(i);
    }
    // const barWidth = width / (dataTimeMax + 1);
    // const yScale = d3
    //   .scaleLinear()
    //   .domain([0, Math.ceil(dataValueMax * 1.2)]) //this is just so the bar doesn't hit the very top of the graph, just for looks
    //   .range([height, 0]);
    const newData: number[] = [];
    data.forEach((el) => {
      for (let i = 0; i < el.value; i++) {
        newData.push(el.time);
      }
    });
    const yScale = d3
      .scaleLinear()
      .domain([0, Math.ceil(dataValueMax * 1.2)]) //this is just so the bar doesn't hit the very top of the graph, just for looks
      .range([height, 0]);
    const histogram = d3
      .bin()
      .value((d) => d)
      .thresholds(newArr);
    //creating the actual bins and then filtering out any undefined returns
    let bars = histogram(newData);
    bars = bars.filter((el) => el.x0 !== undefined);
    d3.selectAll('.bar')
      .data(bars)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => d.x0!)
      .attr('transform', function (d: any) {
        if (xScale) {
          return (
            'translate(' +
            xScale(d!.x0) + //calculating x-offset
            ',' +
            yScale(d.length) + //calculating y-offset (starts from top!`)
            ')'
          );
        } else {
          return 'translate(0,0)';
        }
      })
      // .attr('width', `${barWidth - 1}`)
      .attr('height', function (d: any) {
        return height - yScale(d.length) - 2;
      })
      .style('fill', '#69b3a2');
  };
  const updateChart = () => {
    const colorDict: { [key: string]: string } = {
      broker: 'red',
      consumer: 'blue',
      consumerGroup: 'green',
      topic: 'yellow',
    };
    const nodes: any = [];
    const links: any = [];
    console.log('topics are', topicList);
    if (bootstrap.length) nodes.push({ id: bootstrap, group: 'broker' });
    if (topicList.length) {
      topicList.forEach((el) => {
        nodes.push({ id: el, group: 'topic' });
        links.push({ source: el, target: bootstrap, value: 10 });
      });
    }
    if (consumerList && consumerList.length) {
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
            if (innerEl.members.length) {
              if (
                !nodes.some(
                  (el: { id: string }) => el.id === 'saamsaLoadBalancer'
                )
              )
                nodes.push({ id: innerEl.groupId, group: 'consumerGroup' });
              innerEl.members.forEach((innerInnerEl) => {
                nodes.push({ id: innerInnerEl.memberId, group: 'consumer' });
                links.push({
                  source: innerEl.groupId,
                  target: innerInnerEl.memberId,
                  value: 10,
                });
                if (innerInnerEl && innerInnerEl.stringifiedMetadata.length)
                  links.push({
                    source: innerInnerEl.memberId,
                    target: innerInnerEl.stringifiedMetadata,
                    value: 4,
                  });
              });
            }
          });
        }
      );
    }
    const svg = d3.select('svg');
    const width = 480;
    const height = 480;
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));

    const link = svg
      .selectAll('line')
      .data(links)
      .join('line')
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', (d: any) => Math.sqrt(d.value))
      .attr('stroke-width', 2);

    const node: any = svg
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .append('g')
      .attr('class', (d: any) => `${d.group}`)
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .attr('r', 5)
      .attr('fill', (d: any) => {
        return colorDict[d.group];
      })
      .call(drag(simulation));

    node.append('title').text((d: any) => d.id);

    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      node.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
    });
  };
  // React.useEffect(calculateYScale);
  React.useEffect(() => {
    renderGraph();
    // updateGraph();
  }, [topic]);
  React.useEffect(() => {
    console.log('data has been changed');
    if (d3.selectAll('.bar').size() > 0) {
      updateGraph();
    }
  }, [data]);
  // React.useEffect(() => {
  //   console.log('consumerList changed');
  //   updateChart();
  // }, [consumerList]);
  React.useEffect(() => {
    d3.selectAll('circle').remove();
    d3.selectAll('line').remove();
    chart();
  }, [topicList, consumerList]);
  // React.useEffect(() => {
  //   console.log('charting');
  //   chart();
  // }, [bootstrap]);
  try {
    // chart();
  } catch (error) {
    console.log(error);
  }
  return <div id='mainContainer'>{!!data.length && <h2>{topic}</h2>}</div>;
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
