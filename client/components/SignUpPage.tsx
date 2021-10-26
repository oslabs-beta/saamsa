import * as React from 'react'; 
import '../../client/scss/LoginPage.scss';

type Props = {
signUpAttempt: string | null;
signUp: () => void;
}

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
      signUpAttempt(result);
    } else if (password.length < 6) {
      const result = 'Please create a strong password longer than 6 characters';
      signUpAttempt(result);
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
            alert ('Signup Successful! Please login to proceed.');
            location.reload();
          }
        })
        .catch((err) => console.log(err));
    }
  };

  const SignUpPage = ({
    signUpAttempt, 
    signUp
}: Props): JSX.Element => {
    return (
      <div className='mainWrapper'>
      <div className='headingWrapper'>
        <h1 className='heading'>Saamsa</h1>
      </div>
      <img className="saamsaLogo" src="https://media.discordapp.net/attachments/890965712405946428/898253886811418634/roach_hat.png?width=722&height=722"></img>
      <div className='loginWrapper'>
        <div className='loginTitle'>
          Sign Up
        </div>
  
        {/* <img className="backgroundImage" src="https://t3.ftcdn.net/jpg/02/81/53/44/360_F_281534428_7egrXk3Wm5qR9JXioYSqhE7fXTzaYiXW.jpg" /> */}
  
        <div id='usernameAndPasswordWrapper'>
          <input
            name='username'
            placeholder='username'
            id='username'
            autoComplete='off'
          className='inputFields'/>
          <input
            name='password'
            placeholder='password'
            id='password'
            autoComplete='off'
            type='password'
            className='inputFields'
          />
        </div>
  
        <div id='buttonsDiv'>
          <button
            type='button'
            id='loginBtn'
            onClick={signUp}
            value='Sign-Up'
          >
            Sign Up
          </button>
          {/* <button id='forgotPassword'> Forgot password? </button> */}
          <div id='loginAttemptMessage'>{signUpAttempt}</div>
        </div>
      </div>
      </div>
    );
  };
  export default SignUpPage;
  