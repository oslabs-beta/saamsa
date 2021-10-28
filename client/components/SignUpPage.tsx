import * as React from 'react'; 
import '../../client/scss/LoginPage.scss';

type Props = {
  signUp: () => void;
  loginAttempt: string | null;

}

  const SignUpPage = ({ 
    signUp,
    loginAttempt
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
          <div id='loginAttemptMessage'>{loginAttempt}</div>
        </div>
      </div>
      </div>
    );
  };
  export default SignUpPage;
  