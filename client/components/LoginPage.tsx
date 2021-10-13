/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import '../../client/scss/LoginPage.scss';

type Props = {
  // loginStatus: boolean;
  // changeLoginStatus: (loginStatus: boolean) => void;
  loginAttempt: string | null;
  // changeAttempt: (loginAttempt: string | null) => void;
  loginButton: () => void;
  signUp: () => void;
};

const LoginPage = ({
  // loginStatus,
  // changeLoginStatus,
  loginAttempt,
  // changeAttempt,
  loginButton,
  signUp,
}: Props): JSX.Element => {
  return (
    <div className='loginWrapper'>
      <div className='loginTitle'>
        <h1 className='heading'>Saamsa</h1>
      </div>

      {/* <img className="backgroundImage" src="https://t3.ftcdn.net/jpg/02/81/53/44/360_F_281534428_7egrXk3Wm5qR9JXioYSqhE7fXTzaYiXW.jpg" /> */}

      <div id='usernameAndPasswordWrapper'>
        <input
          name='username'
          placeholder='username'
          id='username'
          autoComplete='off'
        />
        <input
          name='password'
          placeholder='password'
          id='password'
          autoComplete='off'
          type='password'
        />
      </div>

      <div id='buttonsDiv'>
        <button
          type='button'
          id='loginBtn'
          onClick={loginButton}
          value='Log-In'
        >
          Log In
        </button>
        <button id='forgotPassword'> Forgot password? </button>
        <div id='loginAttemptMessage'>{loginAttempt}</div>
      </div>

      <div id='signUpArea'>
        <h2 id='noAccount'>Don&apos;t have an account?</h2>
        <button type='button' onClick={signUp} id='signUpBtn' value='Sign-Up'>
          Sign up
        </button>
      </div>
    </div>
  );
};
export default LoginPage;
