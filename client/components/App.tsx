import * as React from 'react';
// import { BrowserRouter, Route, Link } from 'react-router-dom';
import { IgnorePlugin } from 'webpack';
import Holder from './Holder';
import LoginPage from './LoginPage';


// class User { 
//   constructor(){
//   username: string,
//   password: string,
//   }

// }


const App = (): JSX.Element => {

const [loginStatus, changeLoginStatus] = React.useState<boolean>(false);
const [loginAttempt, changeAttempt] = React.useState< string | null>(null);
const [currentUser, changeUser] = React.useState<string>();
const [rendering, setRendering] = React.useState<boolean>();

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
    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type' : 'application/json' },
      body: JSON.stringify(user),
    })
    .then((res => res.json()))
    .catch((err) => changeAttempt('Incorrect Username or password'))
  
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
    fetch('/signup', {
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
  }
};


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

//else if logged in, take to the main page
return (
  <div>
    {/* <Welcome
    key={1}
    currentUser={currentUser}
    signOut={signOut}
    /> */}
    hello
  </div>
)

}

export default App;
