import {
  useReducer,
  useMemo,
} from 'react';
import produce from 'immer';

const useImmerReducer = (reducer, initialState, initialAction) => {
  const memoReducer = useMemo(() => produce(reducer), [reducer]);
  return useReducer(memoReducer, initialState, initialAction);
};

export default useImmerReducer;
