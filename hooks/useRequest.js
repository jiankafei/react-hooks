import {
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import usePrevious from './usePrevious';
import useSecureAction from './useSecureAction';
import useImmer from './useImmer';

const no = () => Object.create(null);

/**
 * promiseFn: 请求函数，返回 Promise
 * options:
 *    initData: 初始数据
 *    delay: 加载延迟时间
 *    auto: 是否自动请求，该功能使用场景有限，仅作为一种便利功能，如果功能无法满足，请使用run发起请求
 *    cache: 是否缓存上次的数据
 *    reset: 是否每次请求都重置数据
 */

/**
 * return
 *    data
 *    error
 *    loading
 *    run
 *    setData,
 *    resetData,
 *    cancel ?
 *    fetches ?
 */

/**
Concurrent Request:
  并发请求不建议使用 hooks, 因为并发请求都有各自的状态，所以直接使用xhr比较好。
Dependent Request:
  链式请求有两种解决方案：
    1. run 函数返回Promise，从而实现链式请求；
    2. promiseFn 为一个返回promise的链式请求函数，因为链式请求一般只有一个最终状态，所以此方案可行；
  当前选择第二种方案
 */

/**
 * 状态函数方案：
 * done 
 * fail
 * end
 * 1. option 方案；
 * 2. run 函数返回 Promise 方案；
 * 当前选择第一种方案
 */

const delayPromise = (delay) => new Promise((resolve) => {
  setTimeout(resolve, delay);
});

const defaultOptions = {
  initData: null,
  delay: 300,
  auto: false,
  cache: false,
  reset: false,
};

const useRequest = (promiseFn, options) => {
  options = Object.assign(no(), defaultOptions, options);
  const fetchRef = useRef();
  fetchRef.current = promiseFn;
  const doneRef = useRef();
  doneRef.current = options.done;
  const failRef = useRef();
  failRef.current = options.fail;
  const endRef = useRef();
  endRef.current = options.end;
  const initDataRef = useRef();
  initDataRef.current = options.initData;

  const [data, setData] = useImmer(initDataRef.current ?? no());
  const [headers, setHeaders] = useState(no());
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const prevData = usePrevious(data);
  const secureAction = useSecureAction();

  const resetData = useCallback(() => {
    // setData(initDataRef.current ?? no());
    setData(() => initDataRef.current ?? no());
    setHeaders(no());
    setError(null);
  }, [setData]);

  const run = useCallback(async (fetchOptions) => {
    if (options.reset) {
      resetData();
    }

    let delayP;
    if (options.delay) {
      delayP = delayPromise(options.delay);
    }
    try {
      setLoading(true);
      const res = await fetchRef.current(fetchOptions);
      secureAction(() => {
        if (res) {
          // setData(res.data ?? null);
          setData(() => (res.data ?? initDataRef.current ?? no()));
          setHeaders(res.headers ?? null);
          typeof doneRef.current === 'function' && doneRef.current(res.data ?? null, res.headers ?? null);
        }
      });
    } catch (error) {
      console.warn(error);
      secureAction(() => {
        setError(error);
        typeof failRef.current === 'function' && failRef.current(error);
      });
    } finally {
      if (options.delay) {
        try {
          await delayP;
          secureAction(() => {
            setLoading(false);
            typeof endRef.current === 'function' && endRef.current();
          });
        } catch (error) {
          console.warn(error);
        }
      } else {
        secureAction(() => {
          setLoading(false);
          typeof endRef.current === 'function' && endRef.current();
        });
      }
    }
  }, [options.delay, secureAction, setData, options.reset, resetData]);
  // 缓存
  useEffect(() => {
    if (options.cache) setData(() => prevData);
  }, [prevData, options.cache, setData]);
  // 自动请求
  useEffect(() => {
    if (options.auto) run();
  }, [run, options.auto]);

  return {
    data,
    headers,
    error,
    loading,
    run,
    setData,
    resetData,
  };
};

export default useRequest;
