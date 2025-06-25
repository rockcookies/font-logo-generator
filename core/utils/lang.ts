import { Class, ErrRes, OkRes, Res } from './types'

const IS_BROWSER = typeof window !== 'undefined'

export const isBrowser = () => IS_BROWSER

export const hasOwnProperty = <T extends object, K extends keyof T>(val: T, key: K): key is K =>
  Object.prototype.hasOwnProperty.call(val, key)

// https://github.com/sindresorhus/is/blob/main/source/index.ts#L409

export const isDef = <T>(val: T): val is NonNullable<T> => val !== undefined && val !== null

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export const isFunction = (val: unknown): val is Function => typeof val === 'function'

export const isObject = <T extends Record<any, any> = Record<any, any>>(val: unknown): val is T =>
  val !== null && typeof val === 'object' && !Array.isArray(val)

export const isClass = <T = unknown>(value: unknown): value is Class<T> =>
  isFunction(value) && value.toString().startsWith('class ')

export const isPlainObject = (val: unknown): val is Record<any, any> => {
  if (isObject(val) === false) return false

  // If has modified constructor
  const ctor: any = val.constructor
  if (ctor === undefined) return true

  // If has modified prototype

  const prot: any = ctor.prototype
  if (isObject(prot) === false) return false

  // If constructor does not have an Object-specific method
  if (hasOwnProperty(prot, 'isPrototypeOf') === false) {
    return false
  }

  // Most likely a plain Object
  return true
}

export const isPromise = <T = any>(val: unknown): val is Promise<T> =>
  isObject(val) && isFunction(val.then) && isFunction(val.catch)

export const noop = () => {}

export const okRes = <R = any>(value: R): OkRes<R> => ({ isError: false, value })

export const errRes = <E = string>(error: E): ErrRes<E> => ({ isError: true, error })

type TryResReturnType<T> = T extends Promise<any> ? Promise<Res<Awaited<T>, Error>> : Res<T, Error>

export function tryRes<F extends (...args: any[]) => any>(
  fn: F,
  ...args: Parameters<F>
): TryResReturnType<ReturnType<F>> {
  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = fn.apply(this, args)

    if (isPromise(result)) {
      return result.then(
        value => okRes(value),
        error => errRes(error)
      ) as TryResReturnType<ReturnType<F>>
    }

    return okRes(result) as TryResReturnType<ReturnType<F>>
  } catch (error) {
    return errRes(error) as TryResReturnType<ReturnType<F>>
  }
}

export const sleep = (timeoutsMs: number): Promise<void> =>
  new Promise(resolve => {
    setTimeout(() => {
      resolve()
    }, timeoutsMs)
  })

export const deepClone = <T>(original: T): T => {
  if (original instanceof RegExp) {
    return new RegExp(original) as unknown as T
  }

  if (original instanceof Date) {
    return new Date(original) as unknown as T
  }

  if (Array.isArray(original)) {
    return original.map(val => deepClone(val)) as unknown as T
  }

  if (original !== null && typeof original === 'object') {
    const clone: any = {}

    Object.keys(original).forEach(key => {
      clone[key] = deepClone((original as any)[key])
    })

    return clone
  }

  return original
}

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
const shallowEqualIs = (x: any, y: any): boolean => {
  // SameValue algorithm
  if (x === y) {
    // Steps 1-5, 7-10
    // Steps 6.b-6.e: +0 != -0
    // Added the nonzero y check to make Flow happy, but it is redundant
    return x !== 0 || y !== 0 || 1 / x === 1 / y
  } else {
    // Step 6.a: NaN == NaN
    // biome-ignore lint/suspicious/noSelfCompare: <explanation>
    return x !== x && y !== y
  }
}

// https://gist.github.com/grundmanise/909117577709a92beeb49f31db6f69d7

export const shallowEquals = (objA: any, objB: any): boolean => {
  if (shallowEqualIs(objA, objB)) {
    return true
  }

  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false
  }

  const keysA = Object.keys(objA)
  const keysB = Object.keys(objB)

  if (keysA.length !== keysB.length) {
    return false
  }

  // Test for A's keys different from B.
  for (let i = 0; i < keysA.length; i++) {
    if (!hasOwnProperty(objB, keysA[i]) || !shallowEqualIs(objA[keysA[i]], objB[keysA[i]])) {
      return false
    }
  }

  return true
}
