import { cancelRaf, raf } from './dom'

export interface DebouncedFunc<T extends (...args: any[]) => any> {
  (...args: Parameters<T>): ReturnType<T> | undefined
  cancel(): void
  flush(): ReturnType<T> | undefined
}

export function debounce<T extends (...args: any) => any>(
  func: T,
  _wait?: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): DebouncedFunc<T> {
  const maxWait = options?.maxWait ?? 0
  const leading = options?.leading ?? false
  const trailing = options?.trailing ?? true
  const wait = _wait || 0
  const maxing = maxWait > 0

  let lastArgs: any, lastThis: any, result: any, timerId: any

  let lastCallTime = 0
  let lastInvokeTime = 0

  const invokeFunc = (time: number) => {
    const args = lastArgs,
      thisArg = lastThis

    lastArgs = lastThis = undefined
    lastInvokeTime = time
    result = (func as any).apply(thisArg, args)
    return result
  }

  const startTimer = (pendingFunc: () => void): number => {
    cancelRaf(timerId)
    return raf(pendingFunc)
  }

  const cancelTimer = (id: number) => cancelRaf(id)

  const leadingEdge = (time: number) => {
    // Reset any `maxWait` timer.
    lastInvokeTime = time
    // Start the timer for the trailing edge.
    timerId = setTimeout(timerExpired, wait)
    // Invoke the leading edge.
    return leading ? invokeFunc(time) : result
  }

  const remainingWait = (time: number) => {
    const timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime,
      result = wait - timeSinceLastCall

    return maxing ? Math.min(result, maxWait - timeSinceLastInvoke) : result
  }

  const shouldInvoke = (time: number) => {
    const timeSinceLastCall = time - lastCallTime,
      timeSinceLastInvoke = time - lastInvokeTime
    // Either this is the first call, activity has stopped and we're at the trailing
    // edge, the system time has gone backwards and we're treating it as the
    // trailing edge, or we've hit the `maxWait` limit.
    return (
      lastCallTime === undefined ||
      timeSinceLastCall >= wait ||
      timeSinceLastCall < 0 ||
      (maxing && timeSinceLastInvoke >= maxWait)
    )
  }

  const timerExpired = () => {
    const time = Date.now()
    if (shouldInvoke(time)) {
      return trailingEdge(time)
    }
    // Restart the timer.
    timerId = setTimeout(timerExpired, remainingWait(time))
  }

  const trailingEdge = (time: number) => {
    timerId = undefined

    // Only invoke if we have `lastArgs` which means `func` has been debounced at
    // least once.
    if (trailing && lastArgs) {
      return invokeFunc(time)
    }
    lastArgs = lastThis = undefined
    return result
  }

  const cancel = () => {
    if (timerId !== undefined) {
      cancelTimer(timerId)
    }
    lastInvokeTime = 0
    lastCallTime = 0
    lastArgs = lastThis = timerId = undefined
  }

  const flush = () => (timerId === undefined ? result : trailingEdge(Date.now()))

  const pending = () => timerId !== undefined

  function debounced(...rest: any[]) {
    const time = Date.now()
    const isInvoking = shouldInvoke(time)

    lastArgs = rest
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    lastThis = this
    lastCallTime = time

    if (isInvoking) {
      if (timerId === undefined) {
        return leadingEdge(lastCallTime)
      }

      if (maxing) {
        // Handle invocations in a tight loop.
        timerId = startTimer(timerExpired)
        return invokeFunc(lastCallTime)
      }
    }

    if (timerId === undefined) {
      timerId = startTimer(timerExpired)
    }
    return result
  }

  debounced.cancel = cancel
  debounced.flush = flush
  debounced.pending = pending
  return debounced
}

export type ThrottleFunc<T extends (...args: any[]) => any> = DebouncedFunc<T>

export function throttle<T extends (...args: any) => any>(
  func: T,
  wait?: number,
  options?: { leading?: boolean; trailing?: boolean }
): ThrottleFunc<T> {
  return debounce<T>(func, wait, {
    leading: options?.leading,
    maxWait: wait,
    trailing: options?.trailing,
  })
}

type AsyncFunction<R = any, P extends any[] = any[]> = (...args: P) => Promise<R>

export function concurrentAsync<R = any, P extends any[] = any[]>(
  fn: AsyncFunction<R, P>,
  concurrent: number = Number.MAX_SAFE_INTEGER
): AsyncFunction<R, P> {
  const queue: Array<() => Promise<void>> = []
  let pending = 0

  const tick = () => {
    while (queue.length > 0 && pending < concurrent) {
      const task = queue.shift()!
      pending++

      task().then(() => {
        pending--
        tick()
      })
    }
  }

  return function (...args) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const that = this

    return new Promise<R>((resolve, reject) => {
      queue.push(() =>
        fn
          .call(that, ...args)
          .then(resolve)
          .catch(reject)
      )

      tick()
    })
  }
}
