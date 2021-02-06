import {
  useRef,
  useEffect,
  useCallback,
} from 'react';

// Action In Mounted
const useSecureAction = () => {
  const mountedRef = useRef(true);
  useEffect(() => () => {
    mountedRef.current = false;
  }, []);
  return useCallback(callback => {
    if (mountedRef.current) return callback();
  }, []);
};

export default useSecureAction;
