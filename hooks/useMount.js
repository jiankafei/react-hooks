import {
  useRef,
  useEffect,
} from 'react';

const useMount = (fn) => {
  const fnRef = useRef(fn);
  useEffect(() => {
    fnRef.current();
  }, []);
};

export default useMount;
