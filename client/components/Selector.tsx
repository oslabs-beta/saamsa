import * as React from 'react';
import axios from 'axios';
import '../../client/scss/Selector.scss';
import * as d3 from 'd3';
import * as _ from 'lodash';
import useInterval from './useInterval';
interface Props {
  logOut: () => void;
  currentUser: string;
  data: { time: number; value: number }[];
  setData: (arg: { time: number; value: number }[]) => void;
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
const Selector = ({
  logOut,
  currentUser,
  consumerList,
  data,
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
  //function that sends a request to backend to replicate and rebalance load on selected topic using custom Kafka Streams, does not expect a response
  const balanceLoad = (): void => {
    const numPartitions: number = data.reduce((acc, val) => {
      //checking if value is null -> means partition does not exist
      if (val.value !== null && val.time > acc.time) return val;
      else return acc;
    }).time;
    axios({
      method: 'post',
      data: { bootstrap, topic, numPartitions },
      url: 'http://saamsa.io/kafka/balanceLoad',
    }).then((response) => {
      return;
    });
  };
  //update SQL tables
  const updateTables = (arg: string | undefined): void => {
    if (!arg || !arg.length) arg = bootstrap;
    axios({
      method: 'post',
      url: 'http://saamsa.io/kafka/updateTables',
      data: { bootstrap: arg, currentUser },
    }).then((response) => {
      const temp: { topic: string }[] = [...response.data];
      let resultArr = temp.map((el) => el.topic);
      resultArr = resultArr.filter((topic) => topic !== '__consumer_offsets');
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
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const bootstrap: HTMLInputElement | null =
      document.querySelector('#bootstrapInput');
    axios({
      url: 'http://saamsa.io/kafka/createTable',
      method: 'post',
      data: { bootstrap: bootstrap?.value, currentUser },
    }) //if successful, we then repopulate all of our tables, as db has been updated
      .then(() => fetchTables())
      .catch((error) => console.log(error));
  };

  //sends a request to backend to grab all broker-tables from sqldb
  const fetchTables = (): void => {
    axios({
      method: 'post',
      url: 'http://saamsa.io/kafka/fetchTables',
      data: { currentUser },
    }).then((response: { data: { name: string }[] }) => {
      //updating state to force rerender, so option appears on dropdown of bootstrap servers
      setServerList(response.data.map((el) => el.name));
    });
  };

  //custom function that grabs the selected boostrap server from dropdown and then fetches the appropriate topics from db
  const changeServer = (): void => {
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const newBootstrap: HTMLSelectElement | null = document.querySelector(
      '#bootstrap option:checked'
    );
    if (newBootstrap) {
      fetchTopics(newBootstrap.value);
      setBootstrap(newBootstrap.value.replace('_', ':'));
    }
  };

  if (process.env.NODE_ENV !== 'testing') {
    useInterval(() => {
      if (bootstrap.length) {
        updateTables(bootstrap);
        fetchTopics(bootstrap);
        fetchConsumers(bootstrap);
        if (topic.length) {
          changeTopics();
        }
      }
    }, 3000);
  }

  //sends a request to backend to grab topics for passed in bootstrap server
  const fetchTopics = (arg: string) => {
    axios({
      url: 'http://saamsa.io/kafka/fetchTopics',
      method: 'post',
      data: { bootstrap: arg, currentUser },
    }).then((response) => {
      //have to do this copying for typescript to allow mapping method, as response.data is not always an array
      const temp: { topic: string }[] = [...response.data];
      let resultArr = temp.map((el) => el.topic);
      resultArr = resultArr.filter((topic) => topic !== '__consumer_offsets');
      if (!_.isEqual(topicList, resultArr)) setTopicList(resultArr);
    });
  };

  //method that sends request to backend to grab all consumers of passed in bootstrap server
  const fetchConsumers = (arg: string) => {
    axios({
      url: 'http://saamsa.io/kafka/fetchConsumers',
      method: 'post',
      data: { bootstrap: arg, currentUser },
    }).then((response) => {
      //checking if consumerList is equal, as we do not need to needlessly set state and rerender
      if (!_.isEqual(consumerList, response.data))
        setConsumerList(response.data);
    });
  };

  //updates topic state for app, and also sends a request to the backend to update the data with the new chosen topic's partition data
  const changeTopics = (): void => {
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const newTopic: HTMLSelectElement | null = document.querySelector(
      '#topics option:checked'
    ); //grabbing current selected topic
    if (bootstrap.length && newTopic?.value.length) {
      //making initial request so we instantly update the data
      axios({
        method: 'POST',
        url: 'http://saamsa.io/kafka/refresh',
        data: { topic: newTopic?.value, bootstrap, currentUser },
      })
        .then((response: { data: [{ value: number; time: number }] }) => {
          return response;
        })
        .then((response) => {
          if (!_.isEqual(response.data, data)) {
            if (topic !== newTopic?.value) {
              d3.selectAll('.bar').remove();
            }
            setData(response.data);
            if (newTopic?.value !== topic) setTopic(newTopic?.value);
          } //checking if user selected blank topic (if so, graph should disappear)
        });
    } else if (!newTopic?.value.length) {
      //this is if the option chosen is the blank option
      setData([]);
    }
  };

  if (process.env.NODE_ENV !== 'testing') {
    //geting past tables once component renders
    React.useEffect(() => {
      fetchTables();
    }, []);

    //custom react hook to simulate setInterval, but avoids closure issues and uses most up to date state
    useInterval(() => {
      if (bootstrap.length) {
        updateTables(bootstrap);
        fetchTopics(bootstrap);
        fetchConsumers(bootstrap);
        if (topic.length) {
          changeTopics();
        }
      }
    }, 3000);
  }

  return (
    <div id='mainWrapper'>
      <div className='headingWrapper'>
        <h1 id='heading'>Saamsa </h1>
        <div id='loggedIn'>
          <p className='loggedInAs'>Logged in as {currentUser}</p>
          <button className='logOutBtn' onClick={logOut}>
            {' '}
            Log Out{' '}
          </button>
        </div>
      </div>

      <div className='brokersDiv'>
        <div className='newBrokerDiv'>
          <label className='inputLabels' htmlFor='topicInput'>
            Add a new broker:{' '}
          </label>
          <input id='bootstrapInput' placeholder='demo.saamsa.io:29093'></input>
          <button className='Btn' onClick={createTable}>
            Submit
          </button>
        </div>

        <div className='brokerSelector'>
          <p className='inputLabels'>Current broker: </p>
          <select
            className='dropDown'
            name='bootstrap'
            id='bootstrap'
            onChange={() => changeServer()}
          >
            <option className='dropdownOptions'></option>
            {serverListArr}
          </select>
        </div>

        <div className='topicSelector'>
          <p className='inputLabels'>Current topic: </p>

          {/* const topicListArr: JSX.Element[] = [];
  for (let i = 0; i < topicList.length; i++) {
    topicListArr.push(
      <a
        key={topicList[i] + i.toString()}
        className='topicOption'
        value={topicList[i]}
      >
        {topicList[i]}
      </a>
    );
  } */}
          <select
            className='dropDown'
            name='topics'
            id='topics'
            onChange={() => {
              changeTopics();
            }}
          >
            <option className='topicOption'></option>
            {topicListArr}
          </select>
        </div>
        <button className='loadBalanceBtn' onClick={balanceLoad}>
          Balance Load on Topic
        </button>
      </div>
    </div>
  );
};

export default Selector;
