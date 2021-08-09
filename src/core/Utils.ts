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
