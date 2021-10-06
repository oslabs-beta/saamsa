import * as React from 'react';
import { IgnorePlugin } from 'webpack';
import Holder from './Holder';
import LoginPage from './LoginPage';
import Graph from './Graph';
import { collapseTextChangeRangesAcrossMultipleVersions } from '../../node_modules/typescript/lib/typescript';

const App = (): JSX.Element => {

  const [loginStatus, changeLoginStatus] = React.useState<boolean>(false);
  const [loginAttempt, changeAttempt] = React.useState< string | null>(null);
  const [currentUser, changeUser] = React.useState<string>();
  const [rendering, setRendering] = React.useState<boolean>();
  //graph rendering state -> 
  const [data, setData] = React.useState([
    { time: 0, value: 10 },
    { time: 1, value: 50 },
    { time: 2, value: 250 },
    { time: 3, value: 1250 },
    { time: 4, value: 6250 },
  ]);
  //state to check if user is logged in. duplicate of loginstatus and should be removed --> 
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  const loginButton = () => {
    const username: string | null = (document.querySelector('#username') as HTMLInputElement).value ;
    const password: string | null = (document.querySelector('#password') as HTMLInputElement).value ;
    if(username =='' || password ==''){
      const result = 'Please fill out the username and password fields to log in';
      changeAttempt(result);
    }
    else {
    const user: {username: string, password: string} = {
      username: username,
      password: password
      };
      console.log("Hi, i am from the loginbutton method: ",user);

    fetch('http://localhost:3000/login', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify(user),
      })
    .then((res => res.json()))
    .then((data) => {
      console.log(data);
      changeLoginStatus(true);
    })
    .catch((err) => { changeAttempt('Incorrect Username or password'); 
                        console.log(err);
                      } );
    }
  }

const signUp = () => {

  const username: string | null = (document.querySelector('#username') as HTMLInputElement).value ;
  const password: string | null = (document.querySelector('#password') as HTMLInputElement).value ;
 
  if(username == '' || password == ''){
    const result = 'Please fill out the username and password fields';
    changeAttempt(result);
  }
  else if(password.length < 6){
    const result = "Please create a strong password longer than 6 characters";
    changeAttempt(result);
  }
  else{
    const user: {username: string, password: string} = {
      username: username,
      password: password
    };
    console.log("Hi, i am from the signup method: ",user);
    console.log(user);
    console.log("inside the signUp function just before fetch");
    fetch('http://localhost:3000/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    .then((res) => {
      if(res.status == 200){
        changeLoginStatus(true);
        changeUser(username);
      }
    })
    .catch((err) => console.log(err));
    console.log("inside the signUp function after fetch");

  }
}

if(loginStatus === false){
  return (
    <div>
      <LoginPage
        loginButton = {loginButton}
        signUp = {signUp}
        loginAttempt = {loginAttempt}
      /> 
    </div>
  )
}

//else if logged in, return the graph page
  return (
    <div id='mainContainer'>
      <Graph
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        data={data}
      />
    </div>
   )
  }

export default App;
