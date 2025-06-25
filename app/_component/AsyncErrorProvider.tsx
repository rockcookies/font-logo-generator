'use client'

import React from 'react'
import { AsyncErrorCapture } from './Async'
import { toast } from 'sonner'

export function AsyncErrorProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>): ReturnType<React.FC> {
  return (
    <AsyncErrorCapture
      onError={({ error }) => {
        toast.error(`${error}`)
      }}
    >
      {children}
    </AsyncErrorCapture>
  )
}
