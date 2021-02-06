import {
  useRef,
  useEffect,
} from 'react';

const useInterval = (callback, delay) => {
  const callbackRef = useRef();
  callbackRef.current = callback;
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(callbackRef.current, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

export default useInterval;
