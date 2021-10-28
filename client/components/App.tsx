import * as React from 'react';
import LoginPage from './LoginPage';
import Graph from './Graph';
import Selector from './Selector';
import * as d3 from 'd3';

const App = (): JSX.Element => {
  const [xScale, setXScale] = React.useState<
    d3.ScaleLinear<number, number, never>
  >(d3.scaleLinear().range([0, 0]).domain([0, 0]));
  const [consumerList, setConsumerList] = React.useState<any>(null);
  const [loginStatus, changeLoginStatus] = React.useState<boolean>(false);
  const [loginAttempt, changeAttempt] = React.useState<string | null>(null);
  const [currentUser, changeUser] = React.useState<string>('');
  const [topic, setTopic] = React.useState<string>('');
  const [topicList, setTopicList] = React.useState<string[]>([]);
  const [bootstrap, setBootstrap] = React.useState<string>('');
  const [serverList, setServerList] = React.useState<string[]>([]);
  //graph rendering state ->
  const [data, setData] = React.useState<
    Array<{ time: number; value: number }>
  >([]);
  const loginButton = () => {
    const username: string | null = (
      document.querySelector('#username') as HTMLInputElement
    ).value;
    const password: string | null = (
      document.querySelector('#password') as HTMLInputElement
    ).value;
    if (username == '' || password == '') {
      const result =
        'Please fill out the username and password fields to log in';
      changeAttempt(result);
    } else {
      const user: { username: string; password: string } = {
        username: username,
        password: password,
      };
      fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
        .then((res) => res.json())
        .then(() => {
          changeUser(username);
        })
        .then(() => {
          changeLoginStatus(true);
        })
        .catch((err) => {
          changeAttempt('Incorrect Username or password');
          console.log(err);
        });
    }
  };

  const signUp = () => {
    const username: string | null = (
      document.querySelector('#username') as HTMLInputElement
    ).value;
    const password: string | null = (
      document.querySelector('#password') as HTMLInputElement
    ).value;

    if (username == '' || password == '') {
      const result = 'Please fill out the username and password fields';
      changeAttempt(result);
    } else if (password.length < 6) {
      const result = 'Please create a strong password longer than 6 characters';
      changeAttempt(result);
    } else {
      const user: { username: string; password: string } = {
        username: username,
        password: password,
      };
      fetch('http://localhost:3001/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
        .then((res) => {
          if (res.status == 200) {
            changeLoginStatus(true);
            changeUser(username);
          }
        })
        .catch((err) => console.log(err));
    }
  };

  if (loginStatus === false) {
    return (
      <div key='loginPageContainer'>
        <LoginPage
          key='loginPage'
          loginButton={loginButton}
          signUp={signUp}
          loginAttempt={loginAttempt}
        />
      </div>
    );
  } else if (loginStatus === true) {
    return (
      <div key='container'>
        <Selector
          currentUser={currentUser}
          key='selector'
          data={data}
          topic={topic}
          setData={setData}
          setTopic={setTopic}
          bootstrap={bootstrap}
          setBootstrap={setBootstrap}
          topicList={topicList}
          setTopicList={setTopicList}
          serverList={serverList}
          setServerList={setServerList}
          consumerList={consumerList}
          setConsumerList={setConsumerList}
        />
        <div>
          <Graph
            currentUser={currentUser}
            setData={setData}
            setTopic={setTopic}
            bootstrap={bootstrap}
            topicList={topicList}
            consumerList={consumerList}
            topic={topic}
            xScale={xScale}
            setXScale={setXScale}
            data={data}
          />
          <svg id='graphContainer'>
            <g className='graphy'></g>
          </svg>
          <svg id='chartContainer'>
            <g className='charty'></g>
          </svg>
        </div>
      </div>
    );
  }

  return <div key='loadingMessage'>Loading, please wait!</div>;
};

export default App;
