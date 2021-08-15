import type { Extension } from './Extension'

export const getDeepDependencies = (extension: Extension): Array<Extension> => {
  const dependencies = extension.dependsOn ?? []

  return dependencies
    .map((dependency) => getDeepDependencies(dependency))
    .reduce(
      (total, level1Dependencies) => [...total, ...level1Dependencies],
      dependencies,
    )
}

export const sortAlphabetically =
  (desc = true) =>
  (a: string, b: string): number => {
    if (a < b === desc) {
      return -1
    } else if (a > b === desc) {
      return 1
    } else {
      return 0
    }
  }
