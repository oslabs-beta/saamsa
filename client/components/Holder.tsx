import * as React from 'react';

type Props = {
  count: number;
  setCount: (count: number) => void;
};
const Holder = ({ count, setCount }: Props): JSX.Element => {
  return (
    <div>
      <h2>Counter: {count}</h2>
      <button onClick={() => setCount(count + 1)}>Press Me :&#41;</button>
    </div>
  );
};

export default Holder;
