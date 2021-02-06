import {
  useRef,
  useMemo,
} from 'react';
import throttle from 'lodash-es/throttle';

const useThrottle = (fn, wait = 500, options) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const throttled = useMemo(() => throttle((...args) => fnRef.current(...args), wait, optionsRef.options), [wait]);
  return [throttled, throttled.cancel];
}

export default useThrottle;
