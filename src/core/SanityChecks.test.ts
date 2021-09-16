import * as SanityChecks from './SanityChecks'
import {
  ensureAllDependenciesAndExclusivitiesAreDefined,
  ensureAllExtensionsHaveUniqueNames,
  ensureAllIndexesAreCorrect,
  ensureDependantsAreNotExclusiveToEachOther,
  performSanityChecksOnExtensions,
} from './SanityChecks'
import { allExtensions } from '../extensions/allExtensions'
import { generateMockExtension } from '../extensions/MockExtension'

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
        generateMockExtension({ name: 'foo' }),
        generateMockExtension({ name: 'bar' }),
        generateMockExtension({ name: 'baz' }),
      ]),
    ).not.toThrow()
  })

  it('should not throw an error when called with extensions with all unique names', () => {
    expect(() =>
      ensureAllExtensionsHaveUniqueNames([
        generateMockExtension({ name: 'foo' }),
        generateMockExtension({ name: 'bar' }),
        generateMockExtension({ name: 'baz' }),
        generateMockExtension({ name: 'foo' }),
      ]),
    ).toThrow()
  })

  it('should not accept names that only differ in capitalization', () => {
    expect(() =>
      ensureAllExtensionsHaveUniqueNames([
        generateMockExtension({ name: 'someName' }),
        generateMockExtension({ name: 'somename' }),
      ]),
    ).toThrow()
  })
})

describe('ensureDependantsAreNotExclusiveToEachOther', () => {
  const extensionA = generateMockExtension({ name: 'Extension A' })
  const extensionB = generateMockExtension({ name: 'Extension B' })
  const extensionC = generateMockExtension({ name: 'Extension C' })

  it('should allow an empty list of extensions', () => {
    expect(() => ensureDependantsAreNotExclusiveToEachOther([])).not.toThrow()
  })

  it('should allow a list of non-depending and non-exclusive extensions', () => {
    expect(() =>
      ensureDependantsAreNotExclusiveToEachOther([
        extensionA,
        extensionB,
        extensionC,
      ]),
    ).not.toThrow()
  })

  it('should not allow an extension to both depend and be exclusive to another extension', () => {
    const dependantOnAndExclusiveToA = generateMockExtension({
      name: 'Dependant on and exclusive to A',
      dependsOn: [extensionA],
      exclusiveTo: [extensionA],
    })

    expect(() =>
      ensureDependantsAreNotExclusiveToEachOther([
        extensionA,
        dependantOnAndExclusiveToA,
      ]),
    ).toThrow()
  })

  it('should not allow an extension to have dependencies that are exclusive to each other', () => {
    const exclusiveToA = generateMockExtension({
      name: 'Exclusive to A',
      exclusiveTo: [extensionA],
    })
    const dependsOnMutuallyExclusiveExtensions = generateMockExtension({
      name: 'Depends on A and an extension that is exclusive to A',
      dependsOn: [extensionA, exclusiveToA],
    })

    expect(() =>
      ensureDependantsAreNotExclusiveToEachOther([
        extensionA,
        exclusiveToA,
        dependsOnMutuallyExclusiveExtensions,
      ]),
    ).toThrow()
  })
})

describe('ensureAllDependenciesAndExclusivitiesAreDefined', () => {
  it('should accept an extension without dependencies or exclusivities', () => {
    expect(() =>
      ensureAllDependenciesAndExclusivitiesAreDefined([
        generateMockExtension(),
      ]),
    ).not.toThrow()
  })

  it('should accept an extension with only defined dependencies', () => {
    const a = generateMockExtension()
    const b = generateMockExtension({
      dependsOn: [a],
    })
    expect(() =>
      ensureAllDependenciesAndExclusivitiesAreDefined([a, b]),
    ).not.toThrow()
  })

  it('should accept an extension with only defined exclusivities', () => {
    const a = generateMockExtension()
    const b = generateMockExtension({
      exclusiveTo: [a],
    })
    expect(() =>
      ensureAllDependenciesAndExclusivitiesAreDefined([a, b]),
    ).not.toThrow()
  })

  it('should NOT accept an extension with undefined defined exclusivities', () => {
    const a = generateMockExtension({
      // Typescript error expected!
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      exclusiveTo: [undefined],
    })
    expect(() => ensureAllDependenciesAndExclusivitiesAreDefined([a])).toThrow()
  })

  it('should NOT accept an extension with undefined defined dependencies', () => {
    const a = generateMockExtension({
      // Typescript error expected!
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      dependsOn: [undefined],
    })
    expect(() => ensureAllDependenciesAndExclusivitiesAreDefined([a])).toThrow()
  })
})

describe('ensureAllIndexesAreCorrect', () => {
  it('should not throw an error if all indexes match', () => {
    const extensions = Array(10)
      .fill(1)
      .map((_, index) =>
        generateMockExtension({
          index,
        }),
      )

    expect(() => ensureAllIndexesAreCorrect(extensions)).not.toThrow()
  })

  it("should throw an error if an index doesn't match", () => {
    const extensions = Array(10)
      .fill(1)
      .map((_, index) =>
        generateMockExtension({
          index,
        }),
      )

    extensions[3].index = 10

    expect(() => ensureAllIndexesAreCorrect(extensions)).toThrow()
  })
})

describe('performSanityChecksOnExtensions', () => {
  it('should call ensureAllExtensionsHaveUniqueNames', () => {
    const spy = jest.spyOn(SanityChecks, 'ensureAllExtensionsHaveUniqueNames')

    performSanityChecksOnExtensions([])

    expect(spy).toHaveBeenCalled()
  })

  it('should call ensureDependantsAreNotExclusiveToEachOther', () => {
    const spy = jest.spyOn(
      SanityChecks,
      'ensureDependantsAreNotExclusiveToEachOther',
    )

    performSanityChecksOnExtensions([])

    expect(spy).toHaveBeenCalled()
  })

  it('should call ensureAllDependenciesAndExclusivitiesAreDefined', () => {
    const spy = jest.spyOn(
      SanityChecks,
      'ensureAllDependenciesAndExclusivitiesAreDefined',
    )

    performSanityChecksOnExtensions([])

    expect(spy).toHaveBeenCalled()
  })
})
