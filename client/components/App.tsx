import * as React from 'react';
import Graph from './Graph';

const App = (): JSX.Element => {
  const [data, setData] = React.useState([
    { time: 0, value: 10 },
    { time: 1, value: 50 },
    { time: 2, value: 250 },
    { time: 3, value: 1250 },
    { time: 4, value: 6250 },
  ]);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  return (
    <div id='mainContainer'>
      <Graph
        isLoggedIn={isLoggedIn}
        setIsLoggedIn={setIsLoggedIn}
        data={data}
      />
    </div>
  );
};

export default App;
