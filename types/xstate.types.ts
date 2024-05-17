/**
 * @description transform an object states into a flattened union states
 * @example {foo: {fiz: 'fuz', bar: "baz"}} => foo.fiz.fuz | foo.bar.baz
 */
export type FlattenStates<T, TSeparator extends string = "."> = T extends string
  ? T
  : T extends object
    ? {
        [K in keyof T]: T[K] extends Record<string, unknown>
          ? `${K & string}${TSeparator}${FlattenStates<T[K], TSeparator>}` | `${K & string}`
          : `${K & string}${TSeparator}${T[K] & string}`
      }[keyof T]
    : never
