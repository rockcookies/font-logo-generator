import { Res } from '@/core/utils/types'
import { ReactNode } from 'react'

export interface AsyncErrorEvent {
  error: Error
  isPropagationStopped(): boolean
  stopPropagation: () => void
}

export interface AsyncErrorCaptureContextData {
  onError?: (event: AsyncErrorEvent) => void
}

export interface AsyncErrorCaptureProps {
  onError?: (error: AsyncErrorEvent) => void
  children?: ReactNode
}

export interface UseAsyncState<R> {
  loading: boolean
  error?: Error
  data?: R
}

export type UseAsyncResult<R, P extends any[]> = [
  UseAsyncState<R>,
  {
    run: (...args: P) => Promise<void>
    mutate: (data: R | undefined | ((prevData: R | undefined) => R | undefined)) => void
  },
]

export interface UseAsyncProviderOptions {
  onError?: (e: AsyncErrorEvent) => void
}

export interface UseAsyncOptions<R, P extends any[]> {
  initialState?: UseAsyncState<R> | (() => UseAsyncState<R>)
  cacheData?: boolean
  onSuccess?: (data: R, params: P) => void
  onError?: (e: AsyncErrorEvent, params: P) => void
  onComplete?: (res: Res<R, AsyncErrorEvent>, params: P) => void
}

export type UseAsync = <R = any, P extends any[] = any[]>(
  fn: (...args: P) => Promise<R>,
  options?: UseAsyncOptions<R, P>
) => UseAsyncResult<R, P>

export interface UseRunAsyncOptions<R> {
  onSuccess?: (data: R) => void
  onError?: (e: AsyncErrorEvent) => void
  onComplete?: (res: Res<R, AsyncErrorEvent>) => void
}

export type RunAsync = <R>(service: () => Promise<R>, options?: UseRunAsyncOptions<R>) => Promise<void>

export interface UseAsyncErrorHandlerOptions {
  onError?: (e: AsyncErrorEvent) => void
}

export type HandleAsyncError = (err: any) => void
