import * as React from 'react';
import '../../client/scss/App.scss';
import LoginPage from './LoginPage';
import Graph from './Graph';
import Selector from './Selector';
import * as d3 from 'd3';
import SignUpPage from './SignUpPage';
import axios from 'axios';
import * as types from '../../types';
const App = (): JSX.Element => {
  // defining state variables and functions
  const [xScale, setXScale] = React.useState<
    d3.ScaleLinear<number, number, never>
  >(d3.scaleLinear().range([0, 0]).domain([0, 0]));
  const [consumerList, setConsumerList] = React.useState<
    types.consumerListElement[] | null
  >(null);
  const [loginStatus, changeLoginStatus] = React.useState<boolean>(false);
  const [loginAttempt, changeAttempt] = React.useState<string | null>(null);
  const [signUpStatus, changeSignUpStatus] = React.useState<boolean>(false);
  const [currentUser, changeUser] = React.useState<string>('');
  const [topic, setTopic] = React.useState<string>('');
  const [topicList, setTopicList] = React.useState<string[]>([]);
  const [bootstrap, setBootstrap] = React.useState<string>('');
  const [serverList, setServerList] = React.useState<string[]>([]);
  const [data, setData] = React.useState<
    Array<{ time: number; value: number }>
  >([]);
  //function that sends a request to backend to replicate and rebalance load on selected topic using custom Kafka Streams, does not expect a response
  const balanceLoad = (): void => {
    const numPartitions: number = data.reduce((acc, val) => {
      //checking if value is null -> means partition does not exist
      if (val.value !== null && val.time > acc.time) return val;
      else return acc;
    }).time;
    axios({
      method: 'post',
      data: { bootstrap, topic, numPartitions, currentUser },
      url: 'http://saamsa.io/kafka/balanceLoad',
    }).then(() => {
      axios({
        method: 'POST',
        url: 'http://saamsa.io/kafka/refresh',
        data: { topic: `${topic}_balanced`, bootstrap, currentUser },
      })
        .then((response: { data: [{ value: number; time: number }] }) => {
          return response;
        })
        .then((response) => {
          d3.selectAll('.bar').remove();
          setData(response.data);
          setTopic(`${topic}_balanced`);
          const input = document.querySelector('#topics') as HTMLSelectElement;
          input.value = `${topic}_balanced`;
          //checking if user selected blank topic (if so, graph should disappear)
        });
    });
  };
  // login button function
  const loginButton = () => {
    // username is input value in usernmae field
    const username: string | null = (
      document.querySelector('#username') as HTMLInputElement
    ).value;

    // password is input value in password field
    const password: string | null = (
      document.querySelector('#password') as HTMLInputElement
    ).value;

    // if username or password are empty inputs, display error message
    if (username == '' || password == '') {
      const result = 'Please enter your username and password to log in';
      changeAttempt(result);

      // if username and password are filled out, send fetch request to backend to see if user/ pw is correct
    } else {
      const user: { username: string; password: string } = {
        username,
        password,
      };

      fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      })
        // if username or password are empty, have user try again
        .then((res) => {
          if (res.status === 200) {
            changeUser(username);
            changeLoginStatus(true);
          } else {
            changeAttempt('Incorrect username or password. Please try again.');
          }
        })
        .catch((err) => {
          changeAttempt('Incorrect username or password. Please try again.');
          console.log(err);
        });
    }
  };

  const signUpButton = () => {
    changeSignUpStatus(!signUpStatus);
  };

  // Sign Up functionality
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
            alert('Signup Successful! Please login to proceed.');
            location.reload();
          } else
            changeAttempt(
              'User already exists. Please try a different username.'
            );
        })
        .catch((err) => console.log(err));
    }
  };

  const logOut = async () => {
    fetch('http://localhost:3001/logout'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser),
      };
    changeUser('');
    changeLoginStatus(false);
    changeAttempt(null);
    setData([]);
    setConsumerList(null);
    setTopic('');
    setBootstrap('');
    setServerList([]);
    setTopicList([]);
  };

  if (signUpStatus === true) {
    return (
      <div key='signUpPage'>
        <SignUpPage signUp={signUp} loginAttempt={loginAttempt} />
      </div>
    );
  }
  if (loginStatus === false) {
    return (
      <div key='loginPage'>
        <LoginPage
          loginAttempt={loginAttempt}
          loginButton={loginButton}
          signUpButton={signUpButton}
        />
      </div>
    );
  } else if (loginStatus === true) {
    return (
      <div key='selector'>
        <Selector
          logOut={logOut}
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
        <div className='graph'>
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
          <div id='graphAndLBBtn'>
            <svg
              id='graphContainer'
              viewBox='0 0 330 300'
              preserveAspectRatio='xMidYMid meet'
            >
              <g className='graphy'></g>
            </svg>
            <button onClick={balanceLoad} className='loadBalanceBtn'>
              Balance Load On Topic
            </button>
          </div>
          <div id='legend'>
            <div className='brokerBlock'></div>
            <text>broker</text>
            <div className='consumerBlock'></div>
            <text>consumer</text>
            <div className='consumerGroupBlock'></div>
            <text>consumerGroup</text>
            <div className='topicBlock'></div>
            <text>topic</text>
          </div>
          <svg
            id='chartContainer'
            viewBox='0 0 330 300'
            preserveAspectRatio='xMidYMid meet'
          >
            <g className='charty'></g>
          </svg>
        </div>
      </div>
    );
  }
  return <div></div>;
};

export default App;
