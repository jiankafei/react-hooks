import {
  useRef,
  useEffect,
} from "react";

const useUnmount = (fn) => {
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => () => {
    fnRef.current();
  }, []);
};

export default useUnmount;
