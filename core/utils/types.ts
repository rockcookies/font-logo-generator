// https://medium.com/@dhruvrajvanshi/making-exceptions-type-safe-in-typescript-c4d200ee78e9
export interface OkRes<R> {
  isError: false
  value: R
}

export interface ErrRes<E> {
  isError: true
  error: E
}

export type Res<R, E> = OkRes<R> | ErrRes<E>

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export interface Abstract<T> extends Function {
  prototype: T
}

export type Constructable<T = any, Arguments extends unknown[] = any[]> = new (...arguments_: Arguments) => T

export type Class<T = any, Arguments extends unknown[] = any[]> = Constructable<T, Arguments> & { prototype: T }

export type IsEqual<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B ? 1 : 2 ? true : false

type ExceptFilter<KeyType, ExcludeType> =
  IsEqual<KeyType, ExcludeType> extends true ? never : KeyType extends ExcludeType ? never : KeyType

export type Except<ObjectType, KeysType extends keyof ObjectType> = {
  [KeyType in keyof ObjectType as ExceptFilter<KeyType, KeysType>]: ObjectType[KeyType]
}

export type PowerRequired<BaseType, Keys extends keyof BaseType = keyof BaseType> = Pick<
  // Pick just the keys that are not required from the base type.
  BaseType,
  Exclude<keyof BaseType, Keys>
> &
  // Pick the keys that should be required from the base type and make them required.
  Required<Pick<BaseType, Keys>> extends infer InferredType // If `InferredType` extends the previous, then for each key, use the inferred type key.
  ? { [KeyType in keyof InferredType]: InferredType[KeyType] }
  : never

export type Nullable<T> = {
  [P in keyof T]: T[P] | null
}
