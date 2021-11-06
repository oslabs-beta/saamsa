import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Selector from '../client/components/Selector';

configure({ adapter: new Adapter() });

describe('Selector unit tests', () => {
  const props = {
    setData: jest.fn(),
    setTopic: jest.fn(),
    serverList: ['test_test'],
    setServerList: jest.fn(),
    topicList: ['lets_get', 'that_meat'],
    setTopicList: jest.fn(),
    bootstrap: 'test:test',
    setBootstrap: jest.fn(),
    currentUser: 'testUser',
    data: [],
    topic: 'testTopic',
    consumerList: [],
    setConsumerList: jest.fn(),
    logOut: jest.fn(),
  };
  it('should populate the server drop down with the server list', () => {
    const wrapper = shallow(Selector(props));
    expect(wrapper.find('.serverOption').at(0).text()).toBe('');
    expect(wrapper.find('.serverOption').at(1).text()).toBe('test_test');
  });
  it('should populate the topics drop down with the topic list', () => {
    const wrapper = shallow(Selector(props));
    expect(wrapper.find('.topicOption').at(0).text()).toBe('');
    expect(wrapper.find('.topicOption').at(1).text()).toBe('lets_get');
    expect(wrapper.find('.topicOption').at(2).text()).toBe('that_meat');
  });
  it('should have an input field for user to input new server', () => {
    const wrapper = shallow(Selector(props));
    const input = wrapper.find('input');
    expect(input.props().placeholder).toBe('demo.saamsa.io:29093');
    const submitBtn = wrapper.find('#createTableBtn');
    expect(typeof submitBtn.props().onClick).toBe('function');
  });
});
