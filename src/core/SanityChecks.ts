import type { Extension } from './Extension'
import { getDeepDependencies } from './Utils'

export const ensureAllExtensionsHaveUniqueNames = (
  extensions: Array<Extension>,
): void => {
  const names = new Set<string>()

  extensions.forEach(({ name }) => {
    if (names.has(name.toLowerCase())) {
      throw new Error(
        `Two extensions have the name "${name}" (though the capitalization might differ). Please ensure all extensions have unique names!`,
      )
    } else {
      names.add(name.toLowerCase())
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

export const ensureAllDependenciesAndExclusivitiesAreDefined = (
  extensions: Array<Extension>,
): void => {
  extensions.forEach((extension) => {
    if (
      (extension.dependsOn as Array<unknown> | undefined)?.includes(undefined)
    ) {
      throw new Error(`${extension.name} has an undefined dependency!`)
    }

    if (
      (extension.exclusiveTo as Array<unknown> | undefined)?.includes(undefined)
    ) {
      throw new Error(`${extension.name} has an undefined exclusivity!`)
    }
  })
}

export const ensureAllIndexesAreCorrect = (
  extensions: Array<Extension>,
): void => {
  for (let i = 0; i < extensions.length; i++) {
    if (extensions[i].index !== i) {
      throw new Error(
        `${extensions[i].name} extension doesn't have the correct index! Defined index is ${extensions[i].index}, but actual index in array of all extensions is ${i}.`,
      )
    }
  }
}

export const performSanityChecksOnExtensions = (
  extensions: Array<Extension>,
): void => {
  ensureAllDependenciesAndExclusivitiesAreDefined(extensions)
  ensureAllExtensionsHaveUniqueNames(extensions)
  ensureDependantsAreNotExclusiveToEachOther(extensions)
  ensureAllIndexesAreCorrect(extensions)
}
