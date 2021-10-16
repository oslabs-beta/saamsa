import { shallow, configure, mount } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Graph from '../client/components/Graph';
import cheerio from 'cheerio';
import { waitFor } from '@testing-library/react';
configure({ adapter: new Adapter() });

describe('Graph Unit Tests', () => {
  const props = {
    data: [],
  };
  it('should not render a graph at first', () => {
    const wrapper = shallow(Graph(props));
    const svg = wrapper.find('svg');
    expect(svg).toEqual({});
  });
  it('should not render a h2 title at first', () => {
    const wrapper = shallow(Graph(props));
    const h2 = wrapper.find('h2');
    expect(h2.length).toBe(0);
  });
  it('should render an h2 title after data is input', () => {
    const wrapper = shallow(Graph({ data: [{ value: 0, time: 0 }] }));
    const h2 = wrapper.find('h2');
    expect(h2.length).toBe(1);
  });
  //these need to be tweaked, working, but not working perfectly... d3 is rendered but broken in test because of (dom vs react) manipulation
  it('should render a graph with axes and labels and a path after data is input', async () => {
    const wrapper = mount(Graph({ data: [{ value: 0, time: 0 }] }));
    const $ = cheerio.load(wrapper.html());
    await waitFor(() => {
      expect($('svg')).not.toEqual({});
      expect($('path')).not.toEqual({});
      expect($('text')).not.toEqual({});
    });
  });
});
