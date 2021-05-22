import {
  // useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
// import usePrevious from './usePrevious';
import useSafeAction from './useSafeAction';
import useImmer from './useImmer';

/**
 * promiseFn: 请求函数，返回 Promise
 * options:
 *    initData: 初始数据，默认null
 *    delay: 加载延迟时间，单位毫秒
 *    auto: 是否自动请求，默认false，该功能使用场景有限，仅作为一种便利功能，如果功能无法满足，请使用run发起请求
 *    cache: 是否缓存上次的数据，默认false，临时取消
 *    reset: 是否每次请求都重置数据，默认false
 *    sync: 是否同步执行，默认false，尚未支持
 *    done: 成功
 *    fail: 失败
 *    end: 结束
 */

/**
 * return
 * 属性：
 *    headers
 *    data
 *    error
 *    pending
 *    tasks
 * 方法：
 *    run
 *    mutate,
 *    reset,
 *    cancel, 尚未支持
 */

const nil = () => Object.create(null);

// 获取初始默认数据
const getDefaultState = (initData) => ({
  headers: nil(),
  data: initData ?? nil(),
  error: null,
  pending: false,
});

// 延迟承诺
const delayPromise = (delay) => new Promise((resolve) => {
  setTimeout(resolve, delay);
});

// 默认选项
const defaultOptions = {
  initData: null,
  auto: false,
  cache: false,
  reset: false,
  sync: false,
};

const useAsync = (promiseFn, options) => {
  options = Object.assign(nil(), defaultOptions, options);
  const promiseFnRef = useRef(promiseFn);
  promiseFnRef.current = promiseFn;
  const doneRef = useRef(options.done);
  doneRef.current = options.done;
  const failRef = useRef(options.fail);
  failRef.current = options.fail;
  const endRef = useRef(options.end);
  endRef.current = options.end;
  const initDataRef = useRef(options.initData);
  initDataRef.current = options.initData;

  const [currentTask, setCurrentTask] = useImmer(getDefaultState(initDataRef.current));
  const [tasks, setTasks] = useImmer(nil());
  // const prevData = usePrevious(data);
  const secureAction = useSafeAction();

  // tasks 引用
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  // 修改数据
  // stateFn 修改函数
  // taskKey 任务唯一key，可选
  // prop 需要修改的属性，可选
  const modify = useCallback((stateFn, taskKey, prop) => {
    if (taskKey) {
      setTasks((draft) => {
        if (!tasksRef.current[taskKey]) {
          draft[taskKey] = getDefaultState(initDataRef.current);
        }
        let target = prop ? draft[taskKey][prop] : draft[taskKey];
        const newState = stateFn(target);
        if (newState) {
          target = newState;
        }
      });
    } else {
      setCurrentTask((draft) => {
        let target = prop ? draft[prop] : draft;
        const newState = stateFn(target);
        if (newState) {
          target = newState;
        }
      });
    }
  }, [setCurrentTask, setTasks]);

  // 修改 data
  const mutate = useCallback((stateFn, taskKey) => modify(stateFn, taskKey, 'data'), [modify]);

  // 重置数据
  const reset = useCallback((taskKey) => {
    if (taskKey) {
      setTasks((draft) => {
        draft[taskKey] = getDefaultState(initDataRef.current);
      });
    } else {
      setCurrentTask(() => getDefaultState(initDataRef.current));
    }
  }, [setCurrentTask, setTasks]);

  // 执行器
  const run = useCallback(async (params, taskKey) => {
    const delayP = options.delay ? delayPromise(options.delay) : null;

    // const controller = new AbortController();
    // const signal = controller.signal;

    try {
      if (options.reset) reset(taskKey);

      modify((draft) => {
        draft.pending = true;
      }, taskKey);

      const res = await promiseFnRef.current(params);
      secureAction(() => {
        if (res) {
          modify((draft) => {
            draft.data = (res.data ?? initDataRef.current ?? nil());
            draft.headers = res.headers ?? null;
          }, taskKey);
          typeof doneRef.current === 'function' && doneRef.current(res.data ?? null, res.headers ?? null);
        }
      });
    } catch (error) {
      console.warn(error);
      secureAction(() => {
        modify((draft) => {
          draft.error = error;
        }, taskKey);
        typeof failRef.current === 'function' && failRef.current(error);
      });
    } finally {
      if (options.delay) {
        try {
          await delayP;
          secureAction(() => {
            modify((draft) => {
              draft.pending = false;
            }, taskKey);
            typeof endRef.current === 'function' && endRef.current();
          });
        } catch (error) {
          console.warn(error);
        }
      } else {
        secureAction(() => {
          modify((draft) => {
            draft.pending = false;
          }, taskKey);
          typeof endRef.current === 'function' && endRef.current();
        });
      }
    }
  }, [options.delay, options.reset, secureAction, modify, reset]);

  // const cancel = useCallback(() => controller.abort(), []);

  // 缓存
  // useEffect(() => {
  //   if (options.cache) setData(() => prevData);
  // }, [prevData, options.cache, setData]);

  // 自动请求
  useEffect(() => {
    if (options.auto) run();
  }, [run, options.auto]);

  return {
    ...currentTask,
    tasks,
    run,
    // cancel,
    mutate,
    reset,
  };
};

export default useAsync;
