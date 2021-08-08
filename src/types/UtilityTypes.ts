/**
 * Takes Original, but for all keys that are also in Override,
 * the types are changed to those from Override.
 *
 * @example
 * type Original = { foo: string, bar: number }
 * type Override = { bar: boolean }
 * type Overridden = OverrideProperties<Original, Override>
 * // = { foo: string, bar: boolean }
 */
export type OverrideProperties<
  Base extends Record<string | number, unknown>,
  Override extends Partial<Record<keyof Base, unknown>>,
> = Omit<Base, keyof Override> & Override
