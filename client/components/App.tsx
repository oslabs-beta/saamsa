import * as React from 'react';
import Holder from './Holder';
const App = (): JSX.Element => {
  const [count, setCount] = React.useState(0);
  return <Holder count={count} setCount={setCount} />;
};

export default App;
