'use client'

import { useMemoizedFn } from '@/core/hooks/use-advanced'
import { useMountedState } from '@/core/hooks/use-life-cycle'
import { useLatestRef } from '@/core/hooks/use-state'
import { errRes, okRes } from '@/core/utils/lang'
import { createContext, useCallback, useContext, useRef, useState } from 'react'
import type { AsyncErrorCaptureContextData } from './types'
import {
  AsyncErrorEvent,
  HandleAsyncError,
  RunAsync,
  UseAsync,
  UseAsyncErrorHandlerOptions,
  UseAsyncOptions,
  UseAsyncProviderOptions,
  UseAsyncResult,
  UseAsyncState,
  UseRunAsyncOptions,
} from './types'

export const AsyncErrorCaptureContext = createContext<AsyncErrorCaptureContextData>({})

export const useAsyncErrorCaptureContext = (): AsyncErrorCaptureContextData => {
  return useContext(AsyncErrorCaptureContext)
}

const createAsyncErrorEvent = (err: Error): [AsyncErrorEvent, () => void] => {
  let sealed = false
  let propagation = true

  return [
    {
      error: err,
      isPropagationStopped: () => !propagation,
      stopPropagation: () => {
        if (sealed) {
          return
        }

        propagation = false
      },
    },
    () => {
      sealed = true
    },
  ]
}

function generateUseAsync(provider: UseAsyncProviderOptions = {}): UseAsync {
  return function useAsync<R = any, P extends any[] = any[]>(
    fn: (...args: P) => Promise<R>,
    options: UseAsyncOptions<R, P> = {}
  ): UseAsyncResult<R, P> {
    const lastCallKey = useRef<Record<string, any>>(undefined)

    const [state, setState] = useState<UseAsyncState<R>>(() =>
      typeof options.initialState === 'function' ? options.initialState() : options.initialState || { loading: false }
    )

    const context = useContext(AsyncErrorCaptureContext)

    const isMounted = useMountedState()
    const serviceRef = useLatestRef(fn)

    const run = useMemoizedFn(async (...args: P): Promise<void> => {
      const cacheData = options.cacheData
      const callKey: Record<string, any> = {}

      lastCallKey.current = callKey

      if (cacheData) {
        setState(prev => ({ data: prev.data, loading: true }))
      } else {
        setState({ loading: true })
      }

      return serviceRef.current(...args).then(
        data => {
          if (isMounted() && callKey === lastCallKey.current) {
            setState({ data, loading: false })

            if (options.onSuccess) {
              options.onSuccess(data, args)
            }

            if (options.onComplete) {
              options.onComplete(okRes(data), args)
            }
          }
        },
        error => {
          if (isMounted() && callKey === lastCallKey.current) {
            setState({ error, loading: false })

            const [event, seal] = createAsyncErrorEvent(error)

            if (options.onError) {
              options.onError(event, args)
            }

            if (options.onComplete) {
              options.onComplete(errRes(event), args)
            }

            if (provider.onError && !event.isPropagationStopped()) {
              provider.onError(event)
            }

            if (context.onError && !event.isPropagationStopped()) {
              context.onError(event)
            }

            seal()
          }
        }
      )
    })

    const mutate = useCallback((data: any): void => {
      if (typeof data === 'function') {
        setState(preState => ({
          ...preState,
          data: data(preState.data),
        }))
      } else {
        setState(preState => ({ ...preState, data }))
      }
    }, [])

    return [state, { run, mutate }]
  }
}

export const useAsync: UseAsync = generateUseAsync()

export const useAsyncProvider = (options?: UseAsyncProviderOptions): [UseAsync] => [generateUseAsync(options)]

export const useRunAsyncProvider = (provider: UseAsyncProviderOptions = {}): [RunAsync] => {
  const isMounted = useMountedState()

  const context = useContext(AsyncErrorCaptureContext)

  const runAsync = useMemoizedFn(
    <R = any>(fn: () => Promise<R>, options: UseRunAsyncOptions<R> = {}): Promise<void> =>
      fn().then(
        data => {
          if (isMounted()) {
            if (options.onSuccess) {
              options.onSuccess(data)
            }

            if (options.onComplete) {
              options.onComplete(okRes(data))
            }
          }
        },
        error => {
          if (isMounted()) {
            const [event, seal] = createAsyncErrorEvent(error)

            if (options.onError) {
              options.onError(event)
            }

            if (options.onComplete) {
              options.onComplete(errRes(event))
            }

            if (provider.onError && !event.isPropagationStopped()) {
              provider.onError(event)
            }

            if (context.onError && !event.isPropagationStopped()) {
              context.onError(event)
            }

            seal()
          }
        }
      )
  )

  return [runAsync]
}

export const useAsyncErrorHandler = (options: UseAsyncErrorHandlerOptions = {}): [HandleAsyncError] => {
  const isMounted = useMountedState()

  const context = useContext(AsyncErrorCaptureContext)

  const handleError = useMemoizedFn((event: AsyncErrorEvent): void => {
    if (isMounted()) {
      if (options.onError && !event.isPropagationStopped()) {
        options.onError(event)
      }

      if (context.onError && !event.isPropagationStopped()) {
        context.onError(event)
      }
    }
  })

  return [handleError]
}
