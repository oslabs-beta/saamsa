// import * as React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import LoginPage from '../client/components/LoginPage';

configure({ adapter: new Adapter() });

describe('LoginPage unit tests', () => {
  describe('user signup', () => {
    const props = {
      loginAttempt: null,
      loginButton: jest.fn(),
      signUpButton: jest.fn(),
      signUp: jest.fn(),
    };
    let wrapper;
    it('renders username and password input field and signup, login, forgot password buttons', () => {
      wrapper = shallow(LoginPage(props));
      expect(wrapper.find('input').length).toBe(2);
      expect(wrapper.find('button').length).toBe(3);
    });
    it('calls correct functions upon login', () => {
      wrapper = shallow(LoginPage(props));
      wrapper.find('#loginBtn').simulate('click');
      expect(props.loginButton).toHaveBeenCalled();
    });
  });
});
