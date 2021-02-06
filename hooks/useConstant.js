import {
  useRef,
} from 'react';

// 使用常量
const useInsensibleFn = (value) => useRef(value).current;

export default useInsensibleFn;
