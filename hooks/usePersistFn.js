import {
  useRef,
  useCallback,
} from 'react';

// unreactive, anergic, insensible, persist function
// 用于即使函数内部使用了外部变量，在保证使用最新函数的情况下依然返回不会改变的函数
// 既可以使用最新的函数又不会因为每次返回新函数导致依赖该函数的部分更新
// 相较于 useCallBack 会因为外部引用返回新函数的行为，该hook返回不变的函数，但依然能起到和 useCallBack 一样的作用
const usePersistFn = (fn) => {
  const ref = useRef(fn);
  ref.current = fn;
  return useCallback((...args) => ref.current(...args), []);
};

export default usePersistFn;
