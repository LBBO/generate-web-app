// Use this subtype of Extension to allow for easier testing
import { Extension } from './Extension'

type ExtensionLike = Pick<Extension, 'name' | 'dependsOn' | 'exclusiveTo'>

export const ensureAllExtensionsHaveUniqueNames = (
  extensions: Array<ExtensionLike>,
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

export const performSanityChecksOnExtensions = (
  extensions: Array<ExtensionLike>,
): void => {
  ensureAllExtensionsHaveUniqueNames(extensions)
}
