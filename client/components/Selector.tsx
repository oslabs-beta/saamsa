import * as React from 'react';
import axios from 'axios';
interface Props {
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
    const bootstrap: HTMLInputElement | null =
      //change this to be compatible with  enzyme testing, use event.target.etcetc
      document.querySelector('#bootstrapInput');
    axios({
      url: 'http://localhost:3001/kafka/createTable',
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
    axios
      .get<TableList[]>('http://localhost:3001/kafka/fetchTables')
      .then((response) => {
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
    if (newBootstrap?.value.length) {
      //updating state here to cause rerender
      setBootstrap(newBootstrap?.value.replace('_', ':'));
      fetchTopics(newBootstrap?.value);
    }
  };
  //sends a request to backend to grab topics for passed in bootstrap server
  const fetchTopics = (arg: string) => {
    axios({
      url: 'http://localhost:3001/kafka/fetchTopics',
      method: 'post',
      data: { bootstrap: arg },
    }).then((response) => {
      //have to do this copying for typescript to allow mapping method, as response.data is not always an array
      const temp: { topic: string }[] = [...response.data];
      setTopicList(temp.map((el) => el.topic));
    });
  };
  //updates topic state for app, and also sends a request to the backend to update the data with the new chosen topic's partition data
  const changeTopics = (): void => {
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const mainContainer = document.querySelector('#mainContainer');
    if (mainContainer!.className.length > 0)
      //checking if the maincontainer has an interval already set on it, and if it does, we clear it
      window.clearInterval(Number(mainContainer!.className));
    //change this to be compatible with  enzyme testing, use event.target.etcetc
    const newTopic: HTMLSelectElement | null = document.querySelector(
      '#topics option:checked'
    ); //grabbing current selected topic
    if (newTopic?.value.length) setTopic(newTopic?.value); //checking if user selected blank topic (if so, graph should disappear)
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
      const intervalId = window.setInterval(() => {
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
      mainContainer!.className = intervalId.toString();
    } else {
      //this is if the option chosen is the blank option
      setData([]);
    }
  };
  if (process.env.NODE_ENV !== 'testing') {
    React.useEffect(() => {
      console.log('hereee');
      fetchTables();
    }, []);
  }
  return (
    <div>
      SELECT YOUR BROKER :&#41;
      <select name='bootstrap' id='bootstrap' onChange={changeServer}>
        <option className='serverOption'></option>
        {serverListArr}
      </select>
      <label htmlFor='topicInput'>
        Enter a new broker address
        <input id='bootstrapInput' placeholder='localhost:00000'></input>
      </label>
      <button onClick={createTable}>Submit</button>
      SELECT YOUR TOPIC :&#41;
      <select name='topics' id='topics' onChange={changeTopics}>
        <option className='topicOption'></option>
        {topicListArr}
      </select>
    </div>
  );
};

export default Selector;
