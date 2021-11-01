/* eslint-disable @typescript-eslint/no-empty-function */
import * as React from 'react';
import '../../client/scss/LoginPage.scss';

type Props = {
  loginAttempt: string | null;
  loginButton: () => void;
  signUpButton: () => void;
};

const LoginPage = ({
  loginAttempt,
  loginButton,
  signUpButton,
}: Props): JSX.Element => {
  return (
    <div className='mainWrapper'>
      <div className='headingWrapper'>
        <h1 className='heading'>Saamsa</h1>
      </div>
      <img
        className='saamsaLogo'
        src='https://media.discordapp.net/attachments/890965712405946428/898253886811418634/roach_hat.png?width=722&height=722'
      ></img>
      <div className='loginWrapper'>
        <div className='loginTitle'>Welcome</div>

        <div id='usernameAndPasswordWrapper'>
          <input
            name='username'
            placeholder='username'
            id='username'
            autoComplete='off'
            className='inputFields'
          />
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
            onClick={loginButton}
            value='Log-In'
          >
            Log In
          </button>
          <button id='forgotPassword'> Forgot password? </button>
          <div id='loginAttemptMessage'>{loginAttempt}</div>

          <div id='signUpArea'>
            {/* <h2 id="noAccount">Don&apos;t have an account?</h2> */}
          </div>
          <button
            type='button'
            onClick={signUpButton}
            id='signUpButton'
            value='Sign-Up'
          >
            Sign up now!
          </button>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
