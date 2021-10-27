import * as React from 'react';
import axios from 'axios';
import '../../client/scss/Selector.scss';
import * as d3 from 'd3';
import * as _ from 'lodash';
import useInterval from './useInterval';
interface Props {
  graphIntervalId: NodeJS.Timeout | null;
  setGraphIntervalId: (arg: NodeJS.Timeout | null) => void;
  tableIntervalId: NodeJS.Timeout | null;
  setTableIntervalId: (arg: NodeJS.Timeout | null) => void;
  data: { time: number; value: number }[];
  setData: (arg: { time: number; value: number }[]) => void;
  setXScale: (arg: () => d3.ScaleLinear<number, number, never>) => void;
  topic: string;
  setTopic: (arg: string) => void;
  serverList: string[];
  setServerList: (arg: string[]) => void;
  topicList: string[];
  setTopicList: (arg: string[]) => void;
  bootstrap: string;
  setBootstrap: (arg: string) => void;
  consumerList: any;
  setConsumerList: (arg: any) => void;
}
interface TableList {
  name: string;
}
const Selector = ({
  consumerList,
  setXScale,
  graphIntervalId,
  data,
  setGraphIntervalId,
  setTableIntervalId,
  tableIntervalId,
  setData,
  setTopic,
  topic,
  serverList,
  setServerList,
  topicList,
  setTopicList,
  bootstrap,
  setBootstrap,
  setConsumerList,
}: Props): JSX.Element => {
  const balanceLoad = (): void => {
    const numPartitions: number = data.reduce((acc, val) => {
      //checking if value is null -> means partition does not exist
      if (val.value !== null && val.time > acc.time) return val;
      else return acc;
    }).time;
    axios({
      method: 'post',
      data: { bootstrap, topic, numPartitions },
      url: '/kafka/balanceLoad',
    }).then((response) => {
      console.log(response.status);
    });
    /**
     * in here we need to grab the selected server
     * need to create a new topic -> (originalTopicName_balanced) (same number of partitions)
     * need to instatiate a stream onto that topic(do this probably with Java KafkaStreamAPI)
     * stream should then take each message
     * apply someway to key it/partition it in the requested load balance way
     * then write it to that topic
     * stream should then sit on that topic and continue doing this operation until stream is terminated
     * also need to write a way to terminate that stream
     *
     *
     *
     */

    return;
  };

  const updateTables = (arg: string | undefined): void => {
    console.log('from update');
    if (!arg || !arg.length) arg = bootstrap;
    console.log(arg);
    axios({
      method: 'post',
      url: '/kafka/updateTables',
      data: { bootstrap: arg },
    }).then((response) => {
      console.log(response.data);
      const temp: { topic: string }[] = [...response.data];
      const resultArr = temp.map((el) => el.topic);
      if (!_.isEqual(topicList, resultArr)) setTopicList(resultArr);
    });
  };

  //below creates an array filled with options for the bootstrap servers
  const serverListArr: JSX.Element[] = [];
  for (let i = 0; i < serverList.length; i++) {
    serverListArr.push(
      <option
        className='serverOption'
        key={serverList[i] + i.toString()}
        value={serverList[i]}
      >
        {serverList[i]}
      </option>
    );
  }
  //below creates an array filled with options for the topics of selected bootstrap
  const topicListArr: JSX.Element[] = [];
  for (let i = 0; i < topicList.length; i++) {
    topicListArr.push(
      <option
        key={topicList[i] + i.toString()}
        className='topicOption'
        value={topicList[i]}
      >
        {topicList[i]}
      </option>
    );
  }
  //custom function that sends a post request to backend to try grab data from broker at user-inputted host:port
  const createTable = (): void => {
    const bootstrap: HTMLInputElement | null =
      //change this to be compatible with  enzyme testing, use event.target.etcetc
      document.querySelector('#bootstrapInput');
    axios({
      url: '/kafka/createTable',
      method: 'post',
      data: { bootstrap: bootstrap?.value },
    }) //if successful, we then repopulate all of our tables, as db has been updated
      .then(() => {
        fetchTables();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  //sends a request to backend to grab all broker-tables from sqldb
  const fetchTables = (): void => {
    axios.get<TableList[]>('/kafka/fetchTables').then((response) => {
      //updating state to force rerender, so option appears on dropdown of bootstrap servers
      console.log('front end response in fetch tables', response);
      setServerList(response.data.map((el) => el.name));
    });
  };
  //custom function that grabs the selected boostrap server from dropdown and then fetches the appropriate topics from db
  const changeServer = (): void => {
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const newBootstrap: HTMLSelectElement | null = document.querySelector(
      '#bootstrap option:checked'
    );
    console.log('boostrap we grabbed from user', newBootstrap?.value);
    if (newBootstrap?.value.length) {
      //updating state here to cause rerender
      setBootstrap(newBootstrap?.value.replace('_', ':'));
      if (tableIntervalId) clearInterval(tableIntervalId);
    } else {
      setTopicList([]);
      if (tableIntervalId) clearInterval(tableIntervalId);
    }
  };

  if (process.env.NODE_ENV !== 'testing') {
    useInterval(() => {
      if (bootstrap.length) {
        console.log('inside of setinterval bootstrap', bootstrap);
        updateTables(bootstrap);
        fetchTopics(bootstrap);
        fetchConsumers(bootstrap);
        console.log(bootstrap);
        console.log(topic);
        if (topic.length) {
          changeTopics();
        }
      }
    }, 3000);
  }

  //sends a request to backend to grab topics for passed in bootstrap server
  const fetchTopics = (arg: string) => {
    axios({
      url: '/kafka/fetchTopics',
      method: 'post',
      data: { bootstrap: arg },
    }).then((response) => {
      //have to do this copying for typescript to allow mapping method, as response.data is not always an array
      const temp: { topic: string }[] = [...response.data];
      const resultArr = temp.map((el) => el.topic);
      if (!_.isEqual(topicList, resultArr)) setTopicList(resultArr);
    });
  };
  //method that sends request to backend to grab all consumers of passed in bootstrap server
  const fetchConsumers = (arg: string) => {
    axios({
      url: '/kafka/fetchConsumers',
      method: 'post',
      data: { bootstrap: arg },
    }).then((response) => {
      console.log('from fetch consumers');
      console.log(response.data);
      console.log(_.isEqual(consumerList, response.data));
      if (!_.isEqual(consumerList, response.data))
        setConsumerList(response.data);
    });
  };
  //updates topic state for app, and also sends a request to the backend to update the data with the new chosen topic's partition data
  const changeTopics = (): void => {
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    // if (graphIntervalId) {
    //   //checking if the maincontainer has an interval already set on it, and if it does, we clear it
    //   clearInterval(graphIntervalId);
    //   setGraphIntervalId(null);
    // }
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    // const newTopic: HTMLSelectElement | null = document.querySelector(
    //   '#topics option:checked'
    // ); //grabbing current selected topic
    if (bootstrap.length && topic.length) {
      //making initial request so we instantly update the data
      axios({
        method: 'POST',
        url: '/kafka/refresh',
        data: { topic: topic, bootstrap },
      })
        .then((response: { data: [{ value: number; time: number }] }) => {
          //change this to be compatible with  enzyme testing, use event.target.etcetc
          // document.querySelector('svg')?.remove();
          return response;
        })
        .then((response) => {
          // const dataTimeMax: number = response.data.reduce((acc, val) => {
          //   //checking if value is null -> means partition does not exist
          //   if (val.value !== null && val.time > acc.time) return val;
          //   else return acc;
          // }).time;
          // const newXScale = d3
          //   .scaleLinear()
          //   .range([0, 520])
          //   .domain([-0.5, dataTimeMax + 0.5]);
          // console.log(newXScale.range());
          // setXScale(() => newXScale);
          // console.log(data);
          // console.log(response.data);
          // console.log(_.isEqual(response.data, data));
          if (!_.isEqual(response.data, data)) setData(response.data);
          //checking if user selected blank topic (if so, graph should disappear)
        });
      //setting interval of same request above so we autorefresh it (pull model)
    } else if (!topic.length) {
      //this is if the option chosen is the blank option
      setData([]);
    }
  };
  if (process.env.NODE_ENV !== 'testing') {
    React.useEffect(() => {
      fetchTables();
      console.log('literally anything');
    }, []);
  }
  return (
    <div id='mainWrapper'>
      <div className='headingWrapper'>
        <h1 className='heading'>Saamsa</h1>
      </div>

      <div className='brokersDiv'>
        <div className='newBrokerDiv'>
          <label htmlFor='topicInput'>Enter a new broker address</label>
          <input id='bootstrapInput' placeholder='localhost:00000'></input>
        </div>
        <button className='submitBtn' onClick={createTable}>
          Submit
        </button>
        <div className='or'>OR</div>

        <div className='brokerSelector'>
          Select your broker:
          <select
            name='bootstrap'
            id='bootstrap'
            onChange={() => {
              const newBootstrap: HTMLSelectElement | null =
                document.querySelector('#bootstrap option:checked');
              if (newBootstrap) {
                fetchTopics(newBootstrap.value);
                setBootstrap(newBootstrap.value.replace('_', ':'));
              }
            }}
          >
            <option className='serverOption'></option>
            {serverListArr}
          </select>
        </div>

        <div className='topicSelector'>
          Select your topic:
          <select
            name='topics'
            id='topics'
            onChange={() => {
              // changeTopics();
              return;
            }}
          >
            <option className='topicOption'></option>
            {topicListArr}
          </select>
        </div>
        <button onClick={balanceLoad}>Balance Load on Topic</button>
      </div>
    </div>
  );
};

export default Selector;
