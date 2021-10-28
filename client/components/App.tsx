import * as React from 'react';
import '../../client/scss/App.scss';
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
      const result =
        'Please fill out the username and password fields to log in';
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
          if (res.status === 401) {
            // had this be an alert window and reload because signup wasn't working after incorrect entry
            const result = 'Incorrect username or password. Please try again.';
            changeAttempt(result);
            // location.reload();
          }
          // otherwise store the user in state and change login status to true
          else {
            changeUser(username);
            changeLoginStatus(true);
          }
        })
        .catch((err) => {
          changeAttempt('Error logging in. Please try again.');
          console.log(err);
        });
    }
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
          }
        })
        .catch((err) => console.log(err));
    }
  };

  if (loginStatus === false) {
    return (
      <div key='loginPage'>
        <LoginPage
          loginButton={loginButton}
          signUp={signUp}
          loginAttempt={loginAttempt}
          // currentUser = {currentUser}
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
        <div className="graph">
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
