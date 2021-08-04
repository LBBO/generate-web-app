import * as SanityChecks from './SanityChecks'
import {
  ensureAllExtensionsHaveUniqueNames,
  performSanityChecksOnExtensions,
} from './SanityChecks'
import { allExtensions } from '../extensions/allExtensions'

describe('All extensions', () => {
  it('should pass all sanity checks', () => {
    expect(() => performSanityChecksOnExtensions(allExtensions)).not.toThrow()
  })
})

describe('ensureAllExtensionsHaveUniqueNames', () => {
  it('should not throw an error when called without any extensions', () => {
    expect(() => ensureAllExtensionsHaveUniqueNames([])).not.toThrow()
  })

  it('should not throw an error when called with extensions with all unique names', () => {
    expect(() =>
      ensureAllExtensionsHaveUniqueNames([
        { name: 'foo' },
        { name: 'bar' },
        { name: 'baz' },
      ]),
    ).not.toThrow()
  })

  it('should not throw an error when called with extensions with all unique names', () => {
    expect(() =>
      ensureAllExtensionsHaveUniqueNames([
        { name: 'foo' },
        { name: 'bar' },
        { name: 'baz' },
        { name: 'foo' },
      ]),
    ).toThrow()
  })
})

describe('performSanityChecksOnExtensions', () => {
  it('should call ensureAllExtensionsHaveUniqueNames', () => {
    const spy = jest.spyOn(SanityChecks, 'ensureAllExtensionsHaveUniqueNames')

    performSanityChecksOnExtensions([])

    expect(spy).toHaveBeenCalled()
  })
})
