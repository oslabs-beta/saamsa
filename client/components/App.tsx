import * as React from 'react';
import '../../client/scss/App.scss';
import LoginPage from './LoginPage';
import Graph from './Graph';
import Selector from './Selector';
import * as d3 from 'd3';
import SignUpPage from './SignUpPage';
const App = (): JSX.Element => {
  // defining state variables and functions
  const [xScale, setXScale] = React.useState<
    d3.ScaleLinear<number, number, never>
  >(d3.scaleLinear().range([0, 0]).domain([0, 0]));
  const [consumerList, setConsumerList] = React.useState<any>(null);
  const [loginStatus, changeLoginStatus] = React.useState<boolean>(false);
  const [loginAttempt, changeAttempt] = React.useState<string | null>(null);
  const [signUpStatus, changeSignUpStatus] = React.useState<boolean>(false);
  const [currentUser, changeUser] = React.useState<string>('');
  const [rendering, setRendering] = React.useState<boolean>(false);
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
      const result = 'Please enter your username and password to log in';
      changeAttempt(result);

      // if username and password are filled out, send fetch request to backend to see if user/ pw is correct
    } else {
      const user: { username: string; password: string } = {
        username,
        password,
      };

      fetch('http://saamsa.io/login', {
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
      fetch('http://saamsa.io/signup', {
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
    fetch('http://saamsa.io/logout'),
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentUser),
      };
    changeUser('');
    changeLoginStatus(false);
    changeAttempt(null);
    setData([]);
    setTopicList([]);
    setConsumerList([]);
    setServerList([]);
    setTopic('');
    setBootstrap('');
  };

  React.useEffect(() => {
    setRendering(false);
  }, []);
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
          <svg
            id='graphContainer'
            viewBox='0 0 330 300'
            preserveAspectRatio='xMidYMid meet'
          >
            <g className='graphy'></g>
          </svg>
          <svg
            id='chartContainer'
            viewBox='0 0 330 300'
            preserveAspectRatio='xMidYMid meet'
          >
            <g className='charty'></g>
            <g id='legend'>
              <div className='brokerBlock'></div>
              <text>broker</text>
              <div className='consumerBlock'></div>
              <text>consumer</text>
              <div className='consumerGroupBlock'></div>
              <text>consumerGroup</text>
              <div className='topicBlock'></div>
              <text>topic</text>
            </g>
          </svg>
        </div>
      </div>
    );
  }
  return <div></div>;
};

export default App;
