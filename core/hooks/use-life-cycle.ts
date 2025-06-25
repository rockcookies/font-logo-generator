import { type EffectCallback, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { isBrowser } from '../utils/lang'

type EffectHookType = typeof useEffect | typeof useLayoutEffect

export const createUpdateEffect: (hook: EffectHookType) => EffectHookType = hook => (effect, deps) => {
  const isMounted = useRef(false)

  // for react-refresh
  hook(
    () => () => {
      isMounted.current = false
    },
    []
  )

  hook(() => {
    if (!isMounted.current) {
      isMounted.current = true
    } else {
      return effect()
    }
  }, deps)
}

export const useUpdateEffect = createUpdateEffect(useEffect)

export const useEffectOnce = (effect: EffectCallback) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(effect, [])
}

export const useLifecycle = (mount: () => void, unmount?: () => void) => {
  useEffect(() => {
    if (mount) {
      mount()
    }
    return () => {
      if (unmount) {
        unmount()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}

export const useMont = (fn: EffectCallback) => {
  useEffectOnce(fn)
}

export const useUnmount = (fn: () => void) => {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffectOnce(() => () => fnRef.current())
}

export const useMountedState = (): (() => boolean) => {
  const mountedRef = useRef<boolean>(false)
  const get = useCallback(() => mountedRef.current, [])

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  return get
}

export const useUpdate = () => {
  const [, setState] = useState({})

  return useCallback(() => setState({}), [])
}

export const useIsomorphicLayoutEffect = isBrowser() ? useLayoutEffect : useEffect

export const useInitialized = (effect: EffectCallback) => {
  const initializedRef = useRef(false)

  useMont(() => {
    if (!initializedRef.current) {
      initializedRef.current = true
      return effect()
    }
  })
}
