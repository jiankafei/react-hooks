import {
  useState,
  useCallback,
} from 'react';
import produce from 'immer';

const useImmer = (initialState) => {
  const [state, setState] = useState(initialState);
  const setData = useCallback((updater) => {
    setState(produce(updater));
  }, []);
  return [state, setData];
};

export default useImmer;
