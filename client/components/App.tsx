import * as React from 'react';
import LoginPage from './LoginPage';
import Graph from './Graph';
import Selector from './Selector';
const App = (): JSX.Element => {
  const [loginStatus, changeLoginStatus] = React.useState<boolean>(true);
  const [loginAttempt, changeAttempt] = React.useState<string | null>(null);
  const [currentUser, changeUser] = React.useState<string>();
  const [rendering, setRendering] = React.useState<boolean>(false);
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
  React.useEffect(() => {
    setRendering(false);
  }, []);
  if (!rendering) {
    if (loginStatus === false) {
      return (
        <div key='loginPage'>
          <LoginPage
            loginButton={loginButton}
            signUp={signUp}
            loginAttempt={loginAttempt}
          />
        </div>
      );
    } else if (loginStatus === true) {
      return (
        <div key='selector'>
          <Selector
            setData={setData}
            setTopic={setTopic}
            bootstrap={bootstrap}
            setBootstrap={setBootstrap}
            topicList={topicList}
            setTopicList={setTopicList}
            serverList={serverList}
            setServerList={setServerList}
          />
          <Graph data={data} />
        </div>
      );
    }
  }
  return <div key='loadingMessage'>Loading, please wait!</div>;
};

export default App;
