import {
  checkDependencies,
  InvalidDependenciesResponse,
} from './DependencyChecks'
import { generateMockExtension } from '../extensions/MockExtension'
import { performSanityChecksOnExtensions } from './SanityChecks'

describe('checkDependencies', () => {
  const extensionA = generateMockExtension({ name: 'Extension A' })
  const extensionB = generateMockExtension({ name: 'Extension B' })
  const extensionC = generateMockExtension({ name: 'Extension C' })
  const dependsOnA = generateMockExtension({
    name: 'Depends on A',
    dependsOn: [extensionA],
  })
  const dependsOnB = generateMockExtension({
    name: 'Depends on B',
    dependsOn: [extensionB],
  })
  const dependsOnAB = generateMockExtension({
    name: 'Depends on A and B',
    dependsOn: [extensionA, extensionB],
  })
  const dependsOnDependantOfAB = generateMockExtension({
    name: 'Depends on extension that depends on A and B',
    dependsOn: [dependsOnAB],
  })
  const dependsOnDependantOfABAndA = generateMockExtension({
    name: 'Depends on A directly as well as extension that depends on A and B',
    dependsOn: [dependsOnAB, extensionA],
  })

  describe('mock data', () => {
    it('should be valid', () => {
      expect(() =>
        performSanityChecksOnExtensions([
          extensionA,
          extensionB,
          extensionC,
          dependsOnA,
          dependsOnB,
          dependsOnAB,
          dependsOnDependantOfAB,
          dependsOnDependantOfABAndA,
        ]),
      ).not.toThrow()
    })
  })

  it('should accept an empty configuration', () => {
    expect(checkDependencies([]).isValidConfiguration).toBe(true)
  })

  it('should accept extensions that are independent', () => {
    expect(
      checkDependencies([extensionA, extensionB, extensionC])
        .isValidConfiguration,
    ).toBe(true)
  })

  it('should accept two extensions where one depends on the other', () => {
    expect(
      checkDependencies([extensionA, dependsOnA]).isValidConfiguration,
    ).toBe(true)
  })

  it('should NOT accept an extension without its dependant', () => {
    expect(checkDependencies([dependsOnA]).isValidConfiguration).toBe(false)
  })

  it('should return one error for one dependency issue', () => {
    const result = checkDependencies([
      dependsOnA,
    ]) as InvalidDependenciesResponse

    expect(result.errorMessages).toHaveLength(1)
    expect(result.errorMessages[0]).toMatch(extensionA.name)
  })

  it('should return one error per dependency issue', () => {
    const result = checkDependencies([
      dependsOnA,
      dependsOnB,
    ]) as InvalidDependenciesResponse

    expect(result.errorMessages).toHaveLength(2)
    expect(result.errorMessages[0]).toMatch(extensionA.name)
    expect(result.errorMessages[1]).toMatch(extensionB.name)
  })

  it('should accept a config with dependencies that are multiple levels deep', () => {
    expect(
      checkDependencies([
        extensionA,
        extensionB,
        dependsOnAB,
        dependsOnDependantOfAB,
      ]).isValidConfiguration,
    ).toBe(true)
  })

  it('should accept a config where one dependency is depended on both directly and by a sub-dependency', () => {
    expect(
      checkDependencies([
        extensionA,
        extensionB,
        dependsOnAB,
        dependsOnDependantOfABAndA,
      ]).isValidConfiguration,
    ).toBe(true)
  })

  it('should NOT accept a config where any (sub-)dependency is missing', () => {
    expect(
      checkDependencies([extensionB, dependsOnAB, dependsOnDependantOfABAndA])
        .isValidConfiguration,
    ).toBe(false)

    expect(
      checkDependencies([extensionA, extensionB, dependsOnDependantOfABAndA])
        .isValidConfiguration,
    ).toBe(false)
  })
})
