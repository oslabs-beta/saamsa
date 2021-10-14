// import * as React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import LoginPage from '../client/components/LoginPage';

configure({ adapter: new Adapter() });

describe('LoginPage unit tests', () => {
  describe('user signup', () => {
    const userObj = {
      username: 'weewee',
      password: 'booboo',
    };
    const props = {
      loginStatus: false,
      loginAttempt: null,
      loginButton: jest.fn(),
      signUp: jest.fn(),
    };
    let wrapper;
    it('renders username and password input field and signup, login, forgot password buttons', () => {
      wrapper = shallow(LoginPage(props));
      expect(wrapper.find('input').length).toBe(2);
      expect(wrapper.find('button').length).toBe(3);
    });
    it('calls correct functions upon signup and login', () => {
      wrapper = shallow(LoginPage(props));
      wrapper.find('#signUpBtn').simulate('click');
      expect(props.signUp).toHaveBeenCalled();
      wrapper.find('#loginBtn').simulate('click');
      expect(props.loginButton).toHaveBeenCalled();
    });
    it('should show a loginAttempt message upon incorrect signup', () => {
      wrapper = shallow(LoginPage(props));
      wrapper
        .find('#username')
        .simulate('change', { target: { value: 'weewee' } });
      wrapper
        .find('#password')
        .simulate('change', { target: { value: 'bobo' } });
      wrapper.find('#signUpBtn').simulate('click');
      const message = wrapper.find('#loginAttemptMessage');
      expect(message.html()).not.toBeNull();
    });
  });
});
// describe('test test', () => {
//   it('tests stuff :)', () => {
//     expect(2).toBe(2);
//   });
// });
