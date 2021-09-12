import type { Extension } from './Extension'
import child_process from 'child_process'

export const getDeepDependencies = (extension: Extension): Array<Extension> => {
  const dependencies = extension.dependsOn ?? []

  return dependencies
    .map((dependency) => getDeepDependencies(dependency))
    .reduce(
      (total, level1Dependencies) => [...total, ...level1Dependencies],
      dependencies,
    )
}

/**
 * Creates a callback to be passed to Array.sort() in order to sort strings alphabetically.
 * The desc param can be set to change the sorting direction.
 *
 * @param desc
 * @example
 * const arr = ['Iron Man', 'Hulk', 'Thor', 'Captain America']
 * const sorted = arr.sort(sortAlphabetically()) // = ['Captain America', 'Hulk', 'Iron Man', 'Thor']
 */
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

export const asyncRunCommand = (
  entireCommand: string,
  optionOverrides?: child_process.SpawnOptions,
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const [command, ...args] = entireCommand.split(' ')
    const process = child_process.spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      ...optionOverrides,
    })

    process.on('close', (statusCode) => {
      if (statusCode === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}
