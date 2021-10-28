import * as React from 'react';
import * as d3 from 'd3';
import '../../client/scss/Graph.scss';
import axios from 'axios';
import * as _ from 'lodash';
interface Props {
  currentUser: string;
  setData: (arg: any) => void;
  topic: string;
  xScale: d3.ScaleLinear<number, number, never>;
  setXScale: (arg: () => d3.ScaleLinear<number, number, never>) => void;
  data: Array<{ time: number; value: number }>;
  consumerList: any;
  bootstrap: string;
  topicList: string[];
  setTopic: (arg: any) => void;
}
const Graph = ({
  currentUser,
  setData,
  bootstrap,
  data,
  xScale,
  topicList,
  setXScale,
  topic,
  consumerList,
  setTopic,
}: Props): JSX.Element => {
  //method to render bar graph of current data
  const renderGraph = () => {
    //defining dimensions
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
    //calculating max for x and y axis
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
      //removing old x and y axis and labels to make room for new axes
      d3.select('.xAxis').remove();
      d3.select('.yAxis').remove();
      d3.select('.axis-label').remove();
      //transforming data from backend to be in correct form (frequency array)
      const newData: number[] = [];
      data.forEach((el) => {
        for (let i = 0; i < el.value; i++) {
          newData.push(el.time);
        }
      });
      //setting dimensions of main container and subcontainer
      d3.select('#graphContainer')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom);
      d3.select('.graphy').attr(
        'transform',
        `translate(${margin.left}, ${margin.top})`
      );
      //zoom function which grabs the new length of window, then resizes bars and x-axis
      const zoom = (
        arg: d3.Selection<Element, unknown, HTMLElement, unknown>
      ): void => {
        const extent: [[number, number], [number, number]] = [
          [margin.left, margin.top], //new min width and min height after zoom
          [width - margin.right, height - margin.top], //new max width and height after zoom
        ];
        const zoomed = (event: d3.D3ZoomEvent<any, number>) => {
          xScale.range([0, width].map((d) => event.transform.applyX(d))); //applying transform from user
          const newBarWidth =
            (Math.abs(xScale.range()[1] - xScale.range()[0]) / width) *
            barWidth; //not perfectly correct, off by 1, which is noticeable for small partition size, probably something to do with domain being +- 0.5 on x-axis
          arg
            .selectAll('.bar')
            .attr('width', newBarWidth - 1)
            .attr('transform', (d: any): string => {
              //updating x-y coords for each bar and width
              return `translate(${xScale(d!.x0)} ,${yScale(d.length)})`;
            })
            .attr('height', (d: any) => `${height - yScale(d.length) - 2}`);
          d3.select<any, any>('.xAxis').call(
            d3
              .axisBottom(xScale)
              .tickValues(xAxisTicks)
              .tickFormat(d3.format('d'))
          ); //resetting x-axis to use new range
          setXScale(() => xScale); //saving new xScale
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
        d3.select('.graphy');
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
  // nodes: {id: string, group: numorString}[] -> each of the circles (brokers, topics, consumer(groups))
  // links: {source: string, target: string, value: num}[] -> connections between each node, value is strength of force attraction
  //method that actually renders chart
  const chart = () => {
    //dimensions for chart
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
    d3.select('#chartContainer')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom);
    d3.select('.charty').attr(
      'transform',
      `translate(${margin.left}, ${margin.top})`
    );
    const colorDict: { [key: string]: string } = {
      broker: 'red',
      consumer: 'blue',
      consumerGroup: 'green',
      topic: 'yellow',
    };
    const nodes: any = [];
    const links: any = [];
    //adding bootstraps, topics, consumers(groups) to nodes array and the corresponding connections links array
    if (bootstrap.length) nodes.push({ id: bootstrap, group: 'broker' });
    if (topicList.length) {
      topicList.forEach((el) => {
        nodes.push({ id: el, group: 'topic' });
        links.push({ source: el, target: bootstrap, value: 10 });
      });
    }
    if (consumerList && consumerList.length) {
      consumerList.forEach(
        (consumerGroupArray: {
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
          consumerGroupArray.groups.forEach((consumerGroup) => {
            if (consumerGroup.members.length) {
              //below, each saamsaLoadBalancer stream has groupid of saamsaLoadBalancer%%%topic_name -> want to consolidate all of these onto individual node for viz purposes
              if (
                !nodes.some(
                  //only push that node once
                  (el: { id: string }) => el.id === 'saamsaLoadBalancer'
                )
              )
                nodes.push({
                  id: consumerGroup.groupId,
                  group: 'consumerGroup',
                });
              consumerGroup.members.forEach((consumer) => {
                nodes.push({ id: consumer.memberId, group: 'consumer' });
                links.push({
                  source: consumerGroup.groupId,
                  target: consumer.memberId,
                  value: 10,
                });
                if (
                  consumer &&
                  consumer.stringifiedMetadata.length && //stringifiedMetadata is the assigned topic
                  consumer.stringifiedMetadata !== 'topic_not_found' //for unattached consumers, if so, then do not connect to a topic
                ) {
                  links.push({
                    source: consumer.memberId,
                    target: consumer.stringifiedMetadata,
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
    const svg = d3.select('.charty');
    //the physics behind how the nodes interact with each other
    const simulation = d3
      .forceSimulation(nodes)
      .force(
        'link',
        d3.forceLink(links).id((d: any) => d.id)
      )
      .force('charge', d3.forceManyBody())
      .force('center', d3.forceCenter(width / 2, height / 2));
    //constructing lines between nodes
    const link = svg
      .append('g')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', (d: any) => Math.sqrt(d.value))
      .attr('stroke-width', 2);
    //constucting node holders (hold circle and it's text)
    const node: any = svg
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .call(drag(simulation));
    //constructing circles
    const circles = node
      .append('circle')
      .attr('class', (d: any) => d.group)
      .attr('r', 5)
      .attr('fill', (d: any) => {
        return colorDict[d.group];
      });
    //constructing text for each node
    const labels = node
      .append('text')
      .attr('dy', '.35em')
      .text(function (d: any) {
        return d.id;
      });
    //adding changetopic functionality to node map on click of a node
    d3.selectAll('.topic').on('click', (event) => {
      const selectedText = event.target.nextElementSibling.innerHTML;
      if (bootstrap.length && selectedText && selectedText !== topic) {
        //making initial request so we instantly update the data
        axios({
          method: 'POST',
          url: '/kafka/refresh',
          data: { topic: selectedText, bootstrap, currentUser },
        })
          .then((response: { data: [{ value: number; time: number }] }) => {
            return response;
          })
          .then((response) => {
            //ensuring data is not the same so we do not rerender unecessarily
            if (!_.isEqual(response.data, data)) {
              if (topic !== selectedText) {
                //removing old bars in bar graph
                d3.selectAll('.bar').remove();
              }
              setData(response.data);
              setTopic(selectedText);
              //changing topic in selector to match the clicked node
              document.querySelector<HTMLSelectElement>('#topics')!.value =
                selectedText;
            }
          });
      }
    });
    //adding event listener to simulation to update x/y-coords of nodes, connecting lines, and text upon dragging
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y);
      circles.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      labels
        .attr('x', function (d: any) {
          return d.x + 8;
        })
        .attr('y', function (d: any) {
          return d.y;
        });
    });
    return svg.node();
  };
  //actual method which applies drag functionality
  const drag = (simulation: any) => {
    function dragstarted(event: any) {
      //reequilibrates connection network to normal pattern slowly
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }

    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }

    function dragended(event: any) {
      //reequilibrates connection network to normal pattern more quickly
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
  //method to update graph and move bars/axes around upon new data being saved in state
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
      .attr('height', function (d: any) {
        return height - yScale(d.length) - 2;
      })
      .style('fill', '#69b3a2');
  };
  if (process.env.NODE_ENV !== 'testing') {
    React.useEffect(() => {
      //draws new graph when new topic selected
      renderGraph();
    }, [topic]);
    React.useEffect(() => {
      //updates graph when data changes if graph is rendered
      if (d3.selectAll('.bar').size() > 0) {
        updateGraph();
      }
    }, [data]);
    React.useEffect(() => {
      //removes old node map and redraws it when new topic added or new consumer added
      d3.selectAll('.charty g').remove();
      chart();
    }, [topicList, consumerList]);
  }
  return <div>{!!data.length && <h2>{topic}</h2>}</div>;
};

export default Graph;
