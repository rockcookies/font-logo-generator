'use client'
import { FC } from 'react'
import { AsyncErrorCaptureContext, useAsyncErrorCaptureContext } from './hooks'
import { AsyncErrorCaptureProps } from './types'

export const AsyncErrorCapture: FC<AsyncErrorCaptureProps> = ({ onError, children }): ReturnType<FC> => {
  const parent = useAsyncErrorCaptureContext()

  return (
    <AsyncErrorCaptureContext.Provider
      value={{
        onError: event => {
          if (event.isPropagationStopped()) {
            return
          }

          if (onError) {
            onError(event)
          }

          if (!event.isPropagationStopped()) {
            parent.onError?.(event)
          }
        },
      }}
    >
      {children}
    </AsyncErrorCaptureContext.Provider>
  )
}
