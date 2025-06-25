import React, { ReactNode } from 'react'
import { Footer } from './Footer'
import { Header } from './Header'

export function PageInner(props: { children?: ReactNode }): ReturnType<React.FC> {
  return (
    <>
      <Header />
      {props.children}
      <Footer />
    </>
  )
}
