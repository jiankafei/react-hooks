import { useRef, useEffect } from 'react';

const useOn = (target, type, handler, options) => {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => {
    target.addEventListener(type, handlerRef.current, optionsRef.options);
    return () => {
      target.removeEventListener(type, handlerRef.current, optionsRef.options)
    };
  }, [target, type]);
};

export default useOn;
