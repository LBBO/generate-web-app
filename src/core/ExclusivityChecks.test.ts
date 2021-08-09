import type { InvalidExclusivitiesResponse } from './ExclusivityChecks'
import { checkExclusivities } from './ExclusivityChecks'
import { generateMockExtension } from '../extensions/MockExtension'
import { performSanityChecksOnExtensions } from './SanityChecks'

describe('checkExclusivities', () => {
  const extensionA = generateMockExtension({ name: 'Extension A' })
  const extensionB = generateMockExtension({ name: 'Extension B' })
  const extensionC = generateMockExtension({ name: 'Extension C' })

  const exclusiveToA = generateMockExtension({
    name: 'Exclusive to A',
    exclusiveTo: [extensionA],
  })
  const exclusiveToABC = generateMockExtension({
    name: 'Exclusive to A, B, and C',
    exclusiveTo: [extensionA, extensionB, extensionC],
  })

  describe('mock data', () => {
    it('should be valid', () => {
      expect(() =>
        performSanityChecksOnExtensions([extensionA, extensionB, extensionC]),
      ).not.toThrow()
    })
  })

  it('should accept an empty list of extensions', () => {
    expect(checkExclusivities([]).isValidConfiguration).toBe(true)
  })

  it('should accept a list of extensions without exclusivities', () => {
    expect(
      checkExclusivities([extensionA, extensionB, extensionC])
        .isValidConfiguration,
    ).toBe(true)
  })

  it('should NOT accept a list of extensions where one is exclusive to one of the others', () => {
    expect(
      checkExclusivities([extensionA, extensionB, extensionC, exclusiveToA])
        .isValidConfiguration,
    ).toBe(false)
  })

  it('should NOT accept a list of extensions where one is exclusive to multiple of the others', () => {
    expect(
      checkExclusivities([extensionA, extensionB, extensionC, exclusiveToABC])
        .isValidConfiguration,
    ).toBe(false)
  })

  it('should include the names of all forbidden extensions as well as its own name in the error message', () => {
    const result = checkExclusivities([
      extensionA,
      extensionB,
      extensionC,
      exclusiveToABC,
    ]) as InvalidExclusivitiesResponse

    expect(result.isValidConfiguration).toBe(false)
    expect(result.errorMessages[0]).toMatch(exclusiveToABC.name)
    expect(result.errorMessages[0]).toMatch(extensionA.name)
    expect(result.errorMessages[0]).toMatch(extensionB.name)
    expect(result.errorMessages[0]).toMatch(extensionC.name)
  })
})
