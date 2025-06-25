import { RefObject, useMemo, useRef, useState } from 'react'

import { useUpdateEffect } from './use-life-cycle'
import { depsAreSame } from '../utils/react'

export function useMemoizedFn<T extends (...args: any[]) => any>(fn: T): T {
  const fnRef = useRef<T>(fn)

  // why not write `fnRef.current = fn`?
  // https://github.com/alibaba/hooks/issues/728
  fnRef.current = useMemo(() => fn, [fn])

  const memoizedFn = useRef<T>(undefined)

  if (!memoizedFn.current) {
    memoizedFn.current = function (...args) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return fnRef.current?.apply(this, args)
    } as T
  }

  return memoizedFn.current
}

export const useCreationRef = <T>(factory: (prev: T | undefined) => T, deps: any[]): RefObject<T> => {
  const depsRef = useRef(deps)
  const initializedRef = useRef(false)
  const objRef = useRef<T | undefined>(undefined)

  if (initializedRef.current === false || !depsAreSame(depsRef.current, deps)) {
    depsRef.current = deps
    objRef.current = factory(objRef.current)
    initializedRef.current = true
  }

  return objRef as any
}

export const useCreation = <T>(factory: (prev: T | undefined) => T, deps: any[]): T =>
  useCreationRef(factory, deps).current

interface ControlledOptions<T> {
  value?: T
  defaultValue: T | (() => T)
  onChange?: (...args: any[]) => void
}

interface ControlledState<R> {
  controlled: boolean
  value: R
  onChange: (v: R) => void
}

export const useControlledState = <T, R = T>({
  defaultValue,
  value,
  onChange: _onChange,
}: ControlledOptions<T>): ControlledState<R> => {
  const [innerValue, setInnerValue] = useState<T>(() => {
    if (value !== undefined) {
      return value
    }

    return typeof defaultValue === 'function' ? (defaultValue as any)() : defaultValue
  })

  const controlled = value !== undefined
  const mergedValue = controlled ? value : innerValue

  useUpdateEffect(() => {
    if (value !== undefined) {
      setInnerValue(value)
    }
  }, [value])

  const onChange = useMemoizedFn((...args: any[]) => {
    if (!controlled) {
      setInnerValue(args[0])
    }

    if (_onChange) {
      _onChange(...args)
    }
  })

  return {
    controlled,
    value: mergedValue as any,
    onChange,
  }
}
