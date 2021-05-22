import {
  useRef,
} from 'react';
import useOn from './useOn';

export const useClickAway = (container, callback, eventType = 'pointerdown') => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  useOn(document, eventType, (ev) => {
    if (!container.contains(ev.target)) {
      callbackRef.current();
    };
  }, true);
};
