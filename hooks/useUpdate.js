import {
  useReducer,
} from 'react';

const useUpdate = () => useReducer(x => ~x, 0);

export default useUpdate;
