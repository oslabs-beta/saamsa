import { shallow, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Graph from '../client/components/Graph';

configure({ adapter: new Adapter() });

describe('Graph Unit Tests', () => {
  const props = {
    setData: jest.fn(),
    data: [
      { value: 0, time: 0 },
      { value: 1, time: 1 },
    ],
    loginStatus: false,
  };
  it('should not render a graph at first', () => {
    const wrapper = shallow(Graph(props));
    const graphChildren = wrapper.find('#graphContainer').children();
    expect(graphChildren).toEqual({});
  });
});
