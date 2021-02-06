import {
  useRef,
  useMemo,
} from 'react';
import debounce from 'lodash-es/debounce';

const useDebounce = (fn, wait = 500, options) => {
  const fnRef = useRef();
  fnRef.current = fn;
  const optionsRef = useRef();
  optionsRef.current = options;
  const debounced = useMemo(() => debounce((...args) => fnRef.current(...args), wait, optionsRef.options), [wait]);
  return [debounced, debounced.cancel];
}

export default useDebounce;
