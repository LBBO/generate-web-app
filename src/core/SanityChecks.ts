import { Extension } from './Extension'
import { getDeepDependencies } from './Utils'

export const ensureAllExtensionsHaveUniqueNames = (
  extensions: Array<Extension>,
): void => {
  const names = new Set<string>()

  extensions.forEach(({ name }) => {
    if (names.has(name)) {
      throw new Error(
        `Two extensions have the name "${name}". Please ensure all extensions have unique names!`,
      )
    } else {
      names.add(name)
    }
  })
}

export const ensureDependantsAreNotExclusiveToEachOther = (
  extensions: Array<Extension>,
): void => {
  extensions.forEach((extension) => {
    const deepDependencies = getDeepDependencies(extension)

    extension.exclusiveTo?.forEach((forbiddenExtension) => {
      if (deepDependencies.includes(forbiddenExtension)) {
        throw new Error(
          `Extension "${extension.name}" is exclusive to but also depends on extension "${forbiddenExtension.name}"`,
        )
      }
    })

    deepDependencies.forEach((dependency) => {
      dependency.exclusiveTo?.forEach((forbiddenExtension) => {
        if (deepDependencies.includes(forbiddenExtension)) {
          throw new Error(
            `Extension "${extension.name}" has dependency "${dependency.name}" which is exclusive to other dependency "${forbiddenExtension.name}"`,
          )
        }
      })
    })
  })
}

export const performSanityChecksOnExtensions = (
  extensions: Array<Extension>,
): void => {
  ensureAllExtensionsHaveUniqueNames(extensions)
  ensureDependantsAreNotExclusiveToEachOther(extensions)
}
