import * as React from 'react';
import LoginPage from './LoginPage';
import Graph from './Graph';

const App = (): JSX.Element => {
  const [loginStatus, changeLoginStatus] = React.useState<boolean>(false);
  const [loginAttempt, changeAttempt] = React.useState<string | null>(null);
  const [currentUser, changeUser] = React.useState<string>();
  const [rendering, setRendering] = React.useState<boolean>(true);
  //graph rendering state ->
  const [data, setData] = React.useState([
    { time: 0, value: 0 },
    { time: 1, value: 1 },
  ]);
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
      fetch('http://localhost:3000/login', {
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
      fetch('http://localhost:3000/signup', {
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
        <div>
          <LoginPage
            loginButton={loginButton}
            signUp={signUp}
            loginAttempt={loginAttempt}
          />
        </div>
      );
    }
    //else if logged in, return the graph page
    return (
      <div id='mainContainer'>
        <Graph loginStatus={loginStatus} data={data} setData={setData} />
      </div>
    );
  } else {
    return <div>Loading, please wait!</div>;
  }
};

export default App;
