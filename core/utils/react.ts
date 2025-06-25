import { type DependencyList, type PropsWithChildren, type Ref } from 'react'

export type ForwardRefProps<T, R> = PropsWithChildren<T> & {
  ref?: Ref<R>
}

export const depsAreSame = (oldDeps: DependencyList, deps: DependencyList): boolean => {
  if (oldDeps === deps) return true

  for (let i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i])) return false
  }

  return true
}
