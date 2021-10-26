import * as React from 'react';
import axios from 'axios';
import '../../client/scss/Selector.scss';
interface Props {
  graphIntervalId: NodeJS.Timeout | null;
  setGraphIntervalId: (arg: NodeJS.Timeout | null) => void;
  tableIntervalId: NodeJS.Timeout | null;
  setTableIntervalId: (arg: NodeJS.Timeout | null) => void;
  setData: (arg: { time: number; value: number }[]) => void;
  setTopic: (arg: string) => void;
  serverList: string[];
  setServerList: (arg: string[]) => void;
  topicList: string[];
  setTopicList: (arg: string[]) => void;
  bootstrap: string;
  setBootstrap: (arg: string) => void;
}
interface TableList {
  name: string;
}
const Selector = ({
  graphIntervalId,
  setGraphIntervalId,
  setTableIntervalId,
  tableIntervalId,
  setData,
  setTopic,
  serverList,
  setServerList,
  topicList,
  setTopicList,
  bootstrap,
  setBootstrap,
}: Props): JSX.Element => {

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
    const bootstrap: HTMLInputElement | null = document.querySelector('#bootstrapInput');
    axios({
      url: 'http://localhost:3001/kafka/createTable',
      method: 'post',
      data: { bootstrap: bootstrap?.value },
    }) //if successful, we then repopulate all of our tables, as db has been updated
      .then(() => fetchTables())
      .catch((error) => console.log(error));
  };

  //Update the SQL database 
  const updateTables = (arg: string | undefined): void => {
    if (!arg || !arg.length) arg = bootstrap;
    axios({
      method: 'post',
      url: 'http://localhost:3001/kafka/updateTables',
      data: { bootstrap: arg },
    })
  };

  //sends a request to backend to grab all broker-tables from sqldb
  const fetchTables = (): void => {
    axios
      .get<TableList[]>('http://localhost:3001/kafka/fetchTables')
      .then((response) => {
        //updating state to force rerender, so option appears on dropdown of bootstrap servers
        console.log('front end response in fetch tables', response);
        setServerList(response.data.map((el) => el.name));
      });
  };

  //custom function that grabs the selected boostrap server from dropdown and then fetches the appropriate topics from db
  const changeServer = (): void => {
    //reset the table interval
    if (tableIntervalId) clearInterval(tableIntervalId);
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const newBootstrap: HTMLSelectElement | null = document.querySelector('#bootstrap option:checked');
    console.log('boostrap we grabbed from user', newBootstrap?.value);
    //updating state here to cause rerender
    if (newBootstrap?.value.length) setBootstrap(newBootstrap?.value.replace('_', ':'));
    else setTopicList([]);
  };

  if (process.env.NODE_ENV !== 'testing') {
    React.useEffect(() => {
      if (bootstrap.length) {
        const intervalId = setInterval(() => {
          console.log('inside of setinterval bootstrap', bootstrap);
          updateTables(bootstrap);
          fetchTopics(bootstrap);
          fetchConsumers(bootstrap);
        }, 3000);
        setTableIntervalId(intervalId);
      }
    }, [bootstrap]);
  }

  //sends a request to backend to grab topics for passed in bootstrap server
  const fetchTopics = (arg: string) => {
    axios({
      url: 'http://localhost:3001/kafka/fetchTopics',
      method: 'post',
      data: { bootstrap: arg },
    }).then((response) => {
      //have to do this copying for typescript to allow mapping method, as response.data is not always an array
      console.log('Response from BE with all topics', response.data);
      setTopicList(response.data);
    });
  };

  //method that sends request to backend to grab all consumers of passed in bootstrap server
  const fetchConsumers = (arg: string) => {
    axios({
      url: 'http://localhost:3001/kafka/fetchConsumers',
      method: 'post',
      data: { bootstrap: arg },
    }).then((response) => {
      console.log('fetch consumers response data', response);
    });
  };

  //updates topic state for app, and also sends a request to the backend to update the data with the new chosen topic's partition data
  const changeTopics = (): void => {
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    if (graphIntervalId) {
      //checking if the maincontainer has an interval already set on it, and if it does, we clear it
      clearInterval(graphIntervalId);
      setGraphIntervalId(null);
    }
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const newTopic: HTMLSelectElement | null = document.querySelector('#topics option:checked'); 
    //grabbing current selected topic
    if (newTopic?.value.length) setTopic(newTopic?.value); 
    //checking if user selected blank topic (if so, graph should disappear)
    if (bootstrap.length && newTopic?.value.length) {
      //making initial request so we instantly update the data
      axios({
        method: 'POST',
        url: 'http://localhost:3001/kafka/refresh',
        data: { topic: newTopic?.value, bootstrap },
      })
        .then((response) => {
          //change this to be compatible with  enzyme testing, use event.target.etcetc
          document.querySelector('svg')?.remove();
          return response;
        })
        .then((response) => {
          setData(response.data);
        });
      //setting interval of same request above so we autorefresh it (pull model)
      const intervalId = setInterval(() => {
        axios({
          method: 'POST',
          url: 'http://localhost:3001/kafka/refresh',
          data: { topic: newTopic?.value, bootstrap },
        })
          .then((response) => {
            document.querySelector('svg')?.remove();
            return response;
          })
          .then((response) => {
            setData(response.data);
          });
      }, 3000);
      setGraphIntervalId(intervalId);
    } else {
      //this is if the option chosen is the blank option
      setData([]);
    }
  };

  if (process.env.NODE_ENV !== 'testing') {
    React.useEffect(() => {
      fetchTables();
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
          <input id='bootstrapInput' placeholder='localhost:00000' value='localhost:29092'></input>
        </div>
        <button className='submitBtn' onClick={createTable}>
          Submit
        </button>
        
        <div className='or'>OR</div>

        <div className='brokerSelector'>
          Select your broker:
          <select name='bootstrap' id='bootstrap' onChange={changeServer}>
            <option className='serverOption'></option>
            {serverListArr}
          </select>
        </div>

        <div className='topicSelector'>
          Select your topic:
          <select name='topics' id='topics' onChange={changeTopics}>
            <option className='topicOption'></option>
            {topicListArr}
          </select>
        </div>
      </div>
    </div>
  );
};

export default Selector;
