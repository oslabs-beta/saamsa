// import * as React from 'react';
import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import SignUpPage from '../client/components/SignUpPage';

configure({ adapter: new Adapter() });

describe('SignUpPage unit tests', () => {
  describe('user signup', () => {
    const props = {
      loginAttempt: null,
      signUp: jest.fn(),
    };
    let wrapper;
    it('renders username and password input field and signup, login, forgot password buttons', () => {
      wrapper = shallow(SignUpPage(props));
      expect(wrapper.find('input').length).toBe(2);
      expect(wrapper.find('button').length).toBe(1);
    });
    it('calls correct functions upon signup', () => {
      wrapper = shallow(SignUpPage(props));
      wrapper.find('#loginBtn').simulate('click');
      expect(props.signUp).toHaveBeenCalled();
    });
    it('should show a loginAttempt message upon incorrect signup', () => {
      wrapper = shallow(SignUpPage(props));
      wrapper
        .find('#username')
        .simulate('change', { target: { value: 'weewee' } });
      wrapper
        .find('#password')
        .simulate('change', { target: { value: 'bobo' } });
      wrapper.find('#loginBtn').simulate('click');
      const message = wrapper.find('#loginAttemptMessage');
      expect(message.html()).not.toBeNull();
    });
  });
});
