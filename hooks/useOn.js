import { useRef, useEffect } from 'react';

const useOn = (type, handler, options) => {
  const targetRef = useRef();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;
  const optionsRef = useRef(options);
  optionsRef.current = options;
  useEffect(() => {
    const tg = targetRef.current;
    if (tg) {
      tg.addEventListener(type, handlerRef.current, optionsRef.options);
      return () => {
        tg.removeEventListener(type, handlerRef.current, optionsRef.options)
      };
    }
  }, [type]);
  return targetRef;
};

export default useOn;
