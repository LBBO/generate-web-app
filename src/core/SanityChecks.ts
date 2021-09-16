import type { Extension } from './Extension'

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

export type AdjacencyMatrix = Array<Array<boolean>>

export const generateAdjacencyMatrixFromExtensions = (
  extensions: Array<Extension>,
): AdjacencyMatrix => {
  const adjacencyMatrix = Array(extensions.length)
    // needed for technical reasons
    .fill(1)
    .map(() => Array(extensions.length).fill(false))

  extensions.forEach((extension) => {
    extension.dependsOn?.forEach((dependency) => {
      adjacencyMatrix[extension.index][dependency.index] = true
    })
  })

  return adjacencyMatrix
}

export const generateTransitiveHullFromAdjacencyMatrix = (
  adjacencyMatrix: AdjacencyMatrix,
): AdjacencyMatrix => {
  // Create deep copy of adjacency matrix
  const transitiveHull = adjacencyMatrix.map((row) => [...row])

  // Floyd-Warshall algorithm (Warshall variant)
  for (let i = 0; i < transitiveHull.length; i++) {
    for (let j = 0; j < transitiveHull.length; j++) {
      if (transitiveHull[i][j]) {
        for (let k = 0; k < transitiveHull.length; k++) {
          if (transitiveHull[j][k]) {
            transitiveHull[i][k] = true
          }
        }
      }
    }
  }

  return transitiveHull
}

export const ensureDependantsAreNotExclusiveToEachOther = (
  extensions: Array<Extension>,
): void => {
  const adjacencyMatrix = generateAdjacencyMatrixFromExtensions(extensions)
  const transitiveHull =
    generateTransitiveHullFromAdjacencyMatrix(adjacencyMatrix)

  extensions.forEach((extension) => {
    extension.exclusiveTo?.forEach((exclusivity) => {
      // Check that the extensions are not transitively dependant on each other
      // AND exclusive to each other
      if (transitiveHull[extension.index][exclusivity.index]) {
        throw new Error(
          `Extension "${extension.name}" is exclusive to but also (transitively) depends on extension "${exclusivity.name}"`,
        )
      } else if (transitiveHull[exclusivity.index][extension.index]) {
        throw new Error(
          `Extension "${exclusivity.name}" is exclusive to but also (transitively) depends on extension "${extension.name}"`,
        )
      } else {
        // Check that no extension depends on both exclusive extensions
        extensions.forEach((otherExtension) => {
          if (
            transitiveHull[otherExtension.index][extension.index] &&
            transitiveHull[otherExtension.index][exclusivity.index]
          ) {
            throw new Error(
              `Extension "${otherExtension.name}" depends on both "${extension.name}" and "${exclusivity.name}", but they are exclusive to each other.`,
            )
          }
        })
      }
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
