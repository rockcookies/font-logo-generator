import { type Dispatch, RefObject, type SetStateAction, useCallback, useEffect, useRef, useState } from 'react'

import { useMountedState, useUpdate } from './use-life-cycle'

type FuncUpdater<T> = (previousState?: T) => T

export type StoreStateDefaultValue<T> = T | FuncUpdater<T>

export type StorageStateResult<T> = [T | undefined, (value: StoreStateDefaultValue<T>) => void]

export type RequiredStorageStateResult<T> = [T, (value: StoreStateDefaultValue<T>) => void]

export interface StateHelper<T> {
  getValue: () => T
  setValue: (newValue: T) => void
  subscribe: (listener: () => void) => () => void
}

const isFunction = <T>(obj: any): obj is T => typeof obj === 'function'

export const useStateHelper = <T>(state: StateHelper<T>): RequiredStorageStateResult<T> => {
  const update = useUpdate()
  const valueRef = useRef<T>(state.getValue())

  const setEnv = useCallback(
    (data: StoreStateDefaultValue<T>) => {
      const newState = isFunction<FuncUpdater<T>>(data) ? data(state.getValue()) : data
      state.setValue(newState)
    },
    [state]
  )

  useEffect(() => {
    const unSubscribe = state.subscribe(() => {
      valueRef.current = state.getValue()
      update()
    })
    return unSubscribe
  }, [state, update])

  return [valueRef.current, setEnv]
}

export function useSafeState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>]
export function useSafeState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>]
export function useSafeState<S>(initialState?: any): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  const isMounted = useMountedState()

  const [state, setState] = useState(initialState)

  const setCurrentState = useCallback(
    (currentState: any) => {
      /** 如果组件已经卸载则不再更新 state */
      if (!isMounted()) return
      setState(currentState)
    },
    [isMounted]
  )

  return [state, setCurrentState] as const
}

type GetStateAction<S> = () => S

export function useGetState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>, GetStateAction<S>]
export function useGetState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>,
  GetStateAction<S | undefined>,
]

export function useGetState<S>(initialState?: S) {
  const [state, setState] = useState(initialState)
  const stateRef = useRef(state)
  stateRef.current = state

  const getState = useCallback(() => stateRef.current, [])

  return [state, setState, getState]
}

export const useLatestRef = <T>(value: T): RefObject<T> => {
  const ref = useRef(value)
  ref.current = value

  return ref
}
